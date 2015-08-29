$(document).ready(function () {

  var jsonDevices;
  var activeDevice;

  $.getJSON('devices.json', function (data) {
    jsonDevices = data;
    $(jsonDevices).each(function () {
      this["skip"] = false;
    });

    populateDevices();

    $(".js-device").each(function () {
      $(this).on("mousedown", function (event) {
        event.preventDefault();
        if (!event.target.classList.contains("js-draggable") && !event.target.classList.contains("js-btn-close")) {
          var deviceType = this.classList;
          $(this).children('div').each(function () {
            if (this.classList.contains("js-hidden")) {
              this.classList.remove("js-hidden");
              triggerMousedownEvent(this);
              return false;
            }
          });
        }
      });
    });

    $(".btn-save").on("click", function () {
      if (undefined != activeDevice) {
        activeDevice.properties.name = $(".js-property-name").val();
        activeDevice.properties.serial = $(".js-property-serial").val();
        activeDevice.properties.model = $(".js-property-model").val();
      }
    });

    createDraggableObjects();

    $(".js-draggable").draggable({
      revert: "invalid",
      containment: ".table"
    });

    $(".js-draggable").on("mouseup", function (event) {
      if ($(this).css("top") == "0px" && $(this).css("left") == "0px") {
        this.classList.add("js-hidden");
      } else if (!event.target.classList.contains("js-btn-close")) {
        populateProperties(this);
      }
    });

    $(".js-draggable").on("dragstop", function (event, ui) {
      if ($(this).css("top") == "0px" && $(this).css("left") == "0px") {
        this.classList.add("js-hidden");

        var index = $(this).attr("data-device-index");

        clearProperties(jsonDevices[index]);
      } else {
        populateProperties(this);
        populateDevices();
      }
    });

    $(".js-drop-area").droppable({
      tolerance: "fit",
      drop: function (event, ui) {}
    });

    $(".js-btn-close").on("click", function () {

      var index = $(this).parent().attr("data-device-index");

      $(this).parent().addClass("js-hidden");
      $(this).parent().css("top", 0);
      $(this).parent().css("left", 0);

      clearProperties(jsonDevices[index]);
      populateDevices();
    });
  });

  var createDraggableObjects = function () {
    for (i = 0; i < jsonDevices.length; i++) {
      if (jsonDevices[i].type == "media_player") {
        $(".js-media_player").append("<div data-device-index=\"" + i + "\" class=\"js-hidden  js-draggable\">Media Player " + jsonDevices[i].id + "<a class=\"js-btn-close\" href=\"#\">x</a></div>");
      } else if (jsonDevices[i].type == "media_display") {
        $(".js-media_display").append("<div data-device-index=\"" + i + "\" class=\"js-hidden  js-draggable\">Media Display " + jsonDevices[i].id + "<a class=\"js-btn-close\" href=\"#\">x</a></div>");
      } else if (jsonDevices[i].type == "media_server") {
        $(".js-media_server").append("<div data-device-index=\"" + i + "\" class=\"js-hidden  js-draggable\">Media Server " + jsonDevices[i].id + "<a class=\"js-btn-close\" href=\"#\">x</a></div>");
      }
    }
  };

  var getDeviceCounters = function (doCountSkip) {

    var devices = $(jsonDevices);
    var counterPlayer = 0;
    var counterServer = 0;
    var counterDisplay = 0;

    devices.each(function () {
      if (this.type == "media_player" && (doCountSkip || !this.skip)) {
        counterPlayer++;
      } else if (this.type == "media_server" && (doCountSkip || !this.skip)) {
        counterServer++;
      } else if (this.type == "media_display" && (doCountSkip || !this.skip)) {
        counterDisplay++;
      }
    });

    return {
      playerCounter: counterPlayer,
      serverCounter: counterServer,
      displayCounter: counterDisplay
    };
  }

  var triggerMousedownEvent = function (elementToTrigger) {
    var offset = $(elementToTrigger).offset();
    var event = jQuery.Event("mousedown", {
      which: 1,
      pageX: offset.left,
      pageY: offset.top
    });
    $(elementToTrigger).trigger(event);
  }

  var populateDevices = function () {

    var counters = getDeviceCounters(false);
    var counterPlayer = counters.playerCounter;
    var counterServer = counters.serverCounter;
    var counterDisplay = counters.displayCounter;

    $(".js-media_display > .js-counter").text(counterDisplay);
    $(".js-media_server > .js-counter").text(counterServer);
    $(".js-media_player > .js-counter").text(counterPlayer);
  }

  var populateProperties = function (droppedElement) {
    var deviceIndex = $(droppedElement).attr("data-device-index");

    var device = jsonDevices[deviceIndex];
    $(".js-property-name").val(device.properties.name);
    $(".js-property-serial").val(device.properties.serial);
    $(".js-property-model").val(device.properties.model);
    device.skip = true;
    activeDevice = device;
  }

  var clearProperties = function (deviceToClear) {
    if (deviceToClear == activeDevice) {
      $(".js-property-name").val("");
      $(".js-property-serial").val("");
      $(".js-property-model").val("");
      activeDevice = undefined;

      deviceToClear.skip = false;
    }
  }

});