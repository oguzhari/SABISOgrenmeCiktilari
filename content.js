(function () {
  "use strict";

  var PANEL_ID = "sabis-outcome-filler";
  var PROGRAM_SELECTOR = "select.selectPcikti";
  var LEARNING_SELECTOR = "select.selectOcikti";
  var LOCAL_PREVIEW = window.location.protocol === "file:";
  var DEFAULT_DELAY_MS = 140;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function waitForOutcomeTable() {
    if (hasOutcomeSelects()) {
      injectPanel();
      return;
    }

    var observer = new MutationObserver(function () {
      if (hasOutcomeSelects()) {
        observer.disconnect();
        injectPanel();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function hasOutcomeSelects() {
    return document.querySelector(PROGRAM_SELECTOR) || document.querySelector(LEARNING_SELECTOR);
  }

  function injectPanel() {
    var existingPanel = document.getElementById(PANEL_ID);
    if (existingPanel) {
      existingPanel.remove();
    }

    var programOptions = getSourceOptions(PROGRAM_SELECTOR);
    var learningOptions = getSourceOptions(LEARNING_SELECTOR);
    var panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.innerHTML = [
      '<div class="sabis-head">',
      '  <div class="sabis-title">SABIS Çıktı Doldurucu</div>',
      '  <button class="sabis-icon-button" type="button" data-action="toggle" title="Paneli küçült">_</button>',
      '</div>',
      '<div class="sabis-body">',
      '  <div class="sabis-mode sabis-mode-all">',
      '    <div class="sabis-mode-title">Bütün çıktıları doldur</div>',
      '    <div class="sabis-mode-note">Listedeki tüm PÇ ve ÖÇ seçeneklerini tüm sorulara uygular.</div>',
      '    <button class="sabis-action" type="button" data-action="fill-all">Bütün çıktıları doldur</button>',
      '  </div>',
      '  <div class="sabis-mode sabis-mode-clear">',
      '    <div class="sabis-mode-title">Tüm çıktıları temizle</div>',
      '    <div class="sabis-mode-note">Mevcut PÇ ve ÖÇ kayıtlarını siler. İşlemden önce onay sorar.</div>',
      '    <button class="sabis-action danger" type="button" data-action="clear-all">Tüm çıktıları temizle</button>',
      '  </div>',
      '  <div class="sabis-mode sabis-mode-selected">',
      '    <div class="sabis-mode-title">Seçilenlerle doldur</div>',
      '    <div class="sabis-mode-note">Aşağıda işaretlediğiniz PÇ ve ÖÇ seçeneklerini tüm sorulara uygular.</div>',
      '    <div class="sabis-field-title">Program Çıktıları</div>',
      '    <div class="sabis-options" data-kind="program">',
      renderOptionCheckboxes("program", programOptions),
      '    </div>',
      '    <div class="sabis-field-title">Öğrenme Çıktıları</div>',
      '    <div class="sabis-options" data-kind="learning">',
      renderOptionCheckboxes("learning", learningOptions),
      '    </div>',
      '    <button class="sabis-action secondary" type="button" data-action="fill-selected">Seçilenleri tüm sorulara uygula</button>',
      '  </div>',
      '  <div class="sabis-mode sabis-mode-random">',
      '    <div class="sabis-mode-title">Rastgele doldur</div>',
      '    <div class="sabis-mode-note">Her soru için belirttiğiniz adet kadar rastgele PÇ ve ÖÇ atar.</div>',
      '    <div class="sabis-row">',
      '      <label>PÇ adedi<input id="sabis-random-program-count" type="number" min="0" max="' + programOptions.length + '" value="' + getDefaultRandomCount(programOptions.length) + '"></label>',
      '      <label>ÖÇ adedi<input id="sabis-random-learning-count" type="number" min="0" max="' + learningOptions.length + '" value="' + getDefaultRandomCount(learningOptions.length) + '"></label>',
      '    </div>',
      '    <button class="sabis-action secondary" type="button" data-action="fill-random">Her soruya rastgele ata</button>',
      '  </div>',
      '  <label class="sabis-check"><input id="sabis-reload" type="checkbox" checked> İşlem bitince sayfayı yenile</label>',
      '  <div class="sabis-status" role="status">Hazır.</div>',
      '</div>'
    ].join("");

    panel.addEventListener("click", onPanelClick);
    document.body.appendChild(panel);
    updateStatus(getRowCount() + " soru satırı bulundu.", "ok");
  }

  function onPanelClick(event) {
    var action = event.target && event.target.getAttribute("data-action");
    if (!action) {
      return;
    }

    if (action === "toggle") {
      document.getElementById(PANEL_ID).classList.toggle("sabis-collapsed");
      return;
    }

    if (action === "fill-all") {
      runFill("all");
    } else if (action === "fill-selected") {
      runFill("selected");
    } else if (action === "fill-random") {
      runFill("random");
    } else if (action === "clear-all") {
      runClearAll();
    }
  }

  async function runFill(mode) {
    var panel = document.getElementById(PANEL_ID);
    var buttons = Array.prototype.slice.call(panel.querySelectorAll("button"));
    setButtonsDisabled(buttons, true);

    try {
      var rows = getRows();
      if (!rows.length) {
        updateStatus("Soru satırı bulunamadı.", "error");
        return;
      }

      var plan = buildPlan(rows, mode);
      var totalRequests = countRequests(plan);
      if (!totalRequests) {
        updateStatus("Gönderilecek yeni seçim bulunamadı.", "warn");
        return;
      }

      if (LOCAL_PREVIEW) {
        applyPlanToDom(plan);
        updateStatus("Yerel HTML önizlemesi güncellendi. Canlı SABIS sayfasında kayıt da gönderilir.", "warn");
        return;
      }

      var completed = 0;
      for (var i = 0; i < plan.length; i += 1) {
        var item = plan[i];
        applySelectionToSelect(item.programSelect, item.programValues);
        applySelectionToSelect(item.learningSelect, item.learningValues);

        if (item.programValues.length) {
          await saveOutcome("program", item.olcmeId, item.programValues);
          completed += 1;
          updateStatus(completed + "/" + totalRequests + " kayıt gönderildi.");
          await sleep(DEFAULT_DELAY_MS);
        }

        if (item.learningValues.length) {
          await saveOutcome("learning", item.olcmeId, item.learningValues);
          completed += 1;
          updateStatus(completed + "/" + totalRequests + " kayıt gönderildi.");
          await sleep(DEFAULT_DELAY_MS);
        }
      }

      updateStatus("Tamamlandı. " + rows.length + " satır işlendi.", "ok");

      var reload = document.getElementById("sabis-reload");
      if (reload && reload.checked) {
        window.setTimeout(function () {
          window.location.reload();
        }, 900);
      }
    } catch (error) {
      updateStatus(error && error.message ? error.message : "İşlem sırasında hata oluştu.", "error");
    } finally {
      setButtonsDisabled(buttons, false);
    }
  }

  function buildPlan(rows, mode) {
    var selectedProgramValues = [];
    var selectedLearningValues = [];
    var randomProgramCount = 0;
    var randomLearningCount = 0;

    if (mode === "selected") {
      selectedProgramValues = getCheckedPanelValues("program");
      selectedLearningValues = getCheckedPanelValues("learning");
    } else if (mode === "random") {
      randomProgramCount = getNumberInputValue("sabis-random-program-count");
      randomLearningCount = getNumberInputValue("sabis-random-learning-count");
    }

    return rows.map(function (row) {
      var programTarget = getTargetValues(row.programSelect, mode, selectedProgramValues, randomProgramCount);
      var learningTarget = getTargetValues(row.learningSelect, mode, selectedLearningValues, randomLearningCount);

      return {
        row: row.element,
        olcmeId: row.olcmeId,
        programSelect: row.programSelect,
        learningSelect: row.learningSelect,
        programValues: getPostableValues(row.programSelect, programTarget),
        learningValues: getPostableValues(row.learningSelect, learningTarget)
      };
    }).filter(function (item) {
      return item.olcmeId && (item.programValues.length || item.learningValues.length);
    });
  }

  async function runClearAll() {
    var confirmed = window.confirm("Tüm Program ve Öğrenme Çıktıları temizlenecek. Devam edilsin mi?");
    if (!confirmed) {
      updateStatus("Temizleme iptal edildi.", "warn");
      return;
    }

    var panel = document.getElementById(PANEL_ID);
    var buttons = Array.prototype.slice.call(panel.querySelectorAll("button"));
    setButtonsDisabled(buttons, true);

    try {
      var rows = getRows();
      if (!rows.length) {
        updateStatus("Soru satırı bulunamadı.", "error");
        return;
      }

      var plan = buildClearPlan(rows);
      var totalRequests = countDeleteRequests(plan);
      if (!totalRequests) {
        updateStatus("Temizlenecek çıktı bulunamadı.", "warn");
        return;
      }

      if (LOCAL_PREVIEW) {
        applyClearPlanToDom(plan);
        updateStatus("Yerel HTML önizlemesindeki çıktılar temizlendi. Canlı SABIS sayfasında silme kaydı da gönderilir.", "warn");
        return;
      }

      var completed = 0;
      for (var i = 0; i < plan.length; i += 1) {
        var item = plan[i];

        for (var p = 0; p < item.programIds.length; p += 1) {
          await deleteOutcome("program", item.programIds[p]);
          completed += 1;
          updateStatus(completed + "/" + totalRequests + " çıktı temizlendi.");
          await sleep(DEFAULT_DELAY_MS);
        }

        for (var o = 0; o < item.learningIds.length; o += 1) {
          await deleteOutcome("learning", item.learningIds[o]);
          completed += 1;
          updateStatus(completed + "/" + totalRequests + " çıktı temizlendi.");
          await sleep(DEFAULT_DELAY_MS);
        }
      }

      applyClearPlanToDom(plan);
      updateStatus("Temizleme tamamlandı. " + rows.length + " satır işlendi.", "ok");

      var reload = document.getElementById("sabis-reload");
      if (reload && reload.checked) {
        window.setTimeout(function () {
          window.location.reload();
        }, 900);
      }
    } catch (error) {
      updateStatus(error && error.message ? error.message : "Temizleme sırasında hata oluştu.", "error");
    } finally {
      setButtonsDisabled(buttons, false);
    }
  }

  function buildClearPlan(rows) {
    return rows.map(function (row) {
      return {
        row: row.element,
        programSelect: row.programSelect,
        learningSelect: row.learningSelect,
        programIds: getBadgeIds(row.element, ".pCiktiSil[data-id]"),
        learningIds: getBadgeIds(row.element, ".oCiktiSil[data-id]")
      };
    }).filter(function (item) {
      return item.programIds.length || item.learningIds.length;
    });
  }

  function getBadgeIds(row, selector) {
    var ids = [];
    Array.prototype.slice.call(row.querySelectorAll(selector)).forEach(function (badge) {
      var id = badge.getAttribute("data-id");
      if (id && ids.indexOf(id) === -1) {
        ids.push(id);
      }
    });

    return ids;
  }

  function getTargetValues(select, mode, selectedValues, randomCount) {
    var allValues = getAllValues(select);

    if (mode === "selected") {
      return selectedValues;
    }

    if (mode === "random") {
      return pickRandomValues(allValues, randomCount);
    }

    return allValues;
  }

  function getRows() {
    var tableRows = Array.prototype.slice.call(document.querySelectorAll("#tblSorular tr, #tablepc tbody tr"));
    var seen = [];

    return tableRows.map(function (row) {
      var programSelect = row.querySelector(PROGRAM_SELECTOR);
      var learningSelect = row.querySelector(LEARNING_SELECTOR);
      var olcmeId = row.getAttribute("data-id") ||
        (programSelect && programSelect.getAttribute("data-fkpaylarolcmeid")) ||
        (learningSelect && learningSelect.getAttribute("data-fkpaylarolcmeid"));

      if (!programSelect && !learningSelect) {
        return null;
      }

      return {
        element: row,
        olcmeId: olcmeId,
        programSelect: programSelect,
        learningSelect: learningSelect
      };
    }).filter(function (row) {
      if (!row || seen.indexOf(row.element) !== -1) {
        return false;
      }

      seen.push(row.element);
      return true;
    });
  }

  function getRowCount() {
    return getRows().length;
  }

  function getAllValues(select) {
    if (!select) {
      return [];
    }

    return Array.prototype.slice.call(select.options).map(function (option) {
      return option.value;
    });
  }

  function getSourceOptions(selector) {
    var select = document.querySelector(selector);
    if (!select) {
      return [];
    }

    return Array.prototype.slice.call(select.options).map(function (option) {
      return {
        value: option.value,
        label: normalizeWhitespace(option.textContent)
      };
    });
  }

  function renderOptionCheckboxes(kind, options) {
    if (!options.length) {
      return '<div class="sabis-empty">Seçenek bulunamadı.</div>';
    }

    return options.map(function (option, index) {
      var id = "sabis-" + kind + "-option-" + index;
      return [
        '<label class="sabis-option" title="' + escapeHtml(option.label) + '">',
        '  <input type="checkbox" id="' + id + '" data-kind="' + kind + '" value="' + escapeHtml(option.value) + '" checked>',
        '  <span>' + escapeHtml(option.label) + '</span>',
        '</label>'
      ].join("");
    }).join("");
  }

  function getCheckedPanelValues(kind) {
    return Array.prototype.slice.call(document.querySelectorAll('#' + PANEL_ID + ' input[type="checkbox"][data-kind="' + kind + '"]:checked'))
      .map(function (input) {
        return input.value;
      });
  }

  function getNumberInputValue(id) {
    var input = document.getElementById(id);
    var value = input ? Number(input.value) : 0;
    var max = input ? Number(input.max) : 0;

    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }

    if (Number.isFinite(max) && max >= 0) {
      return Math.min(Math.floor(value), max);
    }

    return Math.floor(value);
  }

  function getDefaultRandomCount(optionCount) {
    return optionCount > 0 ? 1 : 0;
  }

  function pickRandomValues(values, count) {
    if (!values.length || count <= 0) {
      return [];
    }

    var pool = values.slice();
    var limit = Math.min(count, pool.length);
    var picked = [];

    for (var i = 0; i < limit; i += 1) {
      var index = Math.floor(Math.random() * pool.length);
      picked.push(pool[index]);
      pool.splice(index, 1);
    }

    return picked;
  }

  function normalizeWhitespace(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getPostableValues(select, desiredValues) {
    if (!select || !desiredValues.length) {
      return [];
    }

    return Array.prototype.slice.call(select.options)
      .filter(function (option) {
        return desiredValues.indexOf(option.value) !== -1 && !option.disabled && !option.selected;
      })
      .map(function (option) {
        return option.value;
      });
  }

  function applyPlanToDom(plan) {
    plan.forEach(function (item) {
      applySelectionToSelect(item.programSelect, item.programValues);
      applySelectionToSelect(item.learningSelect, item.learningValues);
    });
  }

  function applyClearPlanToDom(plan) {
    plan.forEach(function (item) {
      removeBadges(item.row, ".pCiktiSil[data-id]");
      removeBadges(item.row, ".oCiktiSil[data-id]");
      clearSelection(item.programSelect);
      clearSelection(item.learningSelect);
    });
  }

  function removeBadges(row, selector) {
    Array.prototype.slice.call(row.querySelectorAll(selector)).forEach(function (badge) {
      badge.remove();
    });
  }

  function clearSelection(select) {
    if (!select) {
      return;
    }

    Array.prototype.slice.call(select.options).forEach(function (option) {
      option.selected = false;
      option.disabled = false;
    });

    select.dispatchEvent(new Event("change", { bubbles: true }));
    updateMultiselectButton(select);
  }

  function applySelectionToSelect(select, values) {
    if (!select || !values.length) {
      return;
    }

    Array.prototype.slice.call(select.options).forEach(function (option) {
      if (values.indexOf(option.value) !== -1) {
        option.selected = true;
      }
    });

    select.dispatchEvent(new Event("change", { bubbles: true }));
    updateMultiselectButton(select);
  }

  function updateMultiselectButton(select) {
    var button = select.nextElementSibling;
    if (!button || !button.classList.contains("ui-multiselect")) {
      return;
    }

    var label = button.querySelector("span:last-child");
    var count = Array.prototype.slice.call(select.options).filter(function (option) {
      return option.selected;
    }).length;

    if (label) {
      label.textContent = count ? count + " adet seçildi" : "Çıktı Seçiniz";
    }
  }

  async function saveOutcome(type, olcmeId, values) {
    var isProgram = type === "program";
    var endpoint = isProgram ? "/Ders/Sinav/KaydetProgramCiktilari" : "/Ders/Sinav/KaydetOgrenmeCiktilari";
    var listKey = isProgram ? "programCiktilari[]" : "ogrenmeCiktilari[]";
    var body = new URLSearchParams();

    values.forEach(function (value) {
      body.append(listKey, value);
    });
    body.append("FKPaylarOlcmeID", olcmeId);

    var response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: body.toString()
    });

    if (!response.ok) {
      throw new Error("SABIS kayıt isteği başarısız oldu: HTTP " + response.status);
    }
  }

  async function deleteOutcome(type, id) {
    var isProgram = type === "program";
    var endpoint = isProgram ? "/Ders/Sinav/SilProgramCikti" : "/Ders/Sinav/SilOgrenmeCikti";
    var body = new URLSearchParams();
    body.append("ID", id);

    var response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: body.toString()
    });

    if (!response.ok) {
      throw new Error("SABIS silme isteği başarısız oldu: HTTP " + response.status);
    }
  }

  function countRequests(plan) {
    return plan.reduce(function (count, item) {
      return count + (item.programValues.length ? 1 : 0) + (item.learningValues.length ? 1 : 0);
    }, 0);
  }

  function countDeleteRequests(plan) {
    return plan.reduce(function (count, item) {
      return count + item.programIds.length + item.learningIds.length;
    }, 0);
  }

  function setButtonsDisabled(buttons, disabled) {
    buttons.forEach(function (button) {
      if (button.getAttribute("data-action") !== "toggle") {
        button.disabled = disabled;
      }
    });
  }

  function updateStatus(message, state) {
    var panel = document.getElementById(PANEL_ID);
    var status = panel && panel.querySelector(".sabis-status");
    if (!status) {
      return;
    }

    status.className = "sabis-status" + (state ? " " + state : "");
    status.textContent = message;
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  ready(waitForOutcomeTable);
}());
