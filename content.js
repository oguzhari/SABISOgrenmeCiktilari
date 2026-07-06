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

    var panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.innerHTML = [
      '<div class="sabis-head">',
      '  <div class="sabis-title">SABIS Çıktı Doldurucu</div>',
      '  <button class="sabis-icon-button" type="button" data-action="toggle" title="Paneli küçült">_</button>',
      '</div>',
      '<div class="sabis-body">',
      '  <div class="sabis-row">',
      '    <button class="sabis-action" type="button" data-action="select-all">Bütün çıktıları doldur</button>',
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

    if (action === "select-all") {
      runFill();
    }
  }

  async function runFill() {
    var panel = document.getElementById(PANEL_ID);
    var buttons = Array.prototype.slice.call(panel.querySelectorAll("button"));
    setButtonsDisabled(buttons, true);

    try {
      var rows = getRows();
      if (!rows.length) {
        updateStatus("Soru satırı bulunamadı.", "error");
        return;
      }

      var plan = buildPlan(rows);
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

  function buildPlan(rows) {
    return rows.map(function (row) {
      var programTarget = getAllValues(row.programSelect);
      var learningTarget = getAllValues(row.learningSelect);

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

  function countRequests(plan) {
    return plan.reduce(function (count, item) {
      return count + (item.programValues.length ? 1 : 0) + (item.learningValues.length ? 1 : 0);
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
