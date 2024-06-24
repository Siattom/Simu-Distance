const RoadIO = (function() {
    const initialZoomLevel = 11;
    const initialPosition = { lat: 52.36388108888907, lng: 4.876605157366489 };
    const userToken = "741131bb-88ac-5471-898c-1a978d0c8563";
    const googleApiKey = "AIzaSyCHKZ2EUvq0Auxg6utOCuO_40eesyG2MNc";
    const baseUrl = "https://map.road.io";
    const clusterMarkers = {};
    const locationMarkers = {};
    const maxGenerations = 100;
    const widget = document.getElementById('road-embed-map');
    const sidebar = document.createElement('div');
    sidebar.setAttribute('class', 'road-embed-map-sidebar');
    const errorMessage = document.createElement('div');
    errorMessage.setAttribute("class", "road-embed-map-error");
  
    let selectedLocation = null;
    let selectedCluster = null;
    let generation = 0;
    let map = null;
    let search = null;
    let autocomplete = null;
  
    const css = `
    #road-embed-map {
      overflow: hidden;
      position: relative;
    }
    #road-embed-map .road-embed-map-search {
      position: absolute;
      z-index: 10001;
      top: 5px;
      left: 5px;
      width: 280px;
      font-weight: 400;
      font-size: 14px;
      padding-right: 45px;
      margin: 0;
      max-width: 100%;
      flex: 1 0 auto;
      outline: none;
      -webkit-tap-highlight-color: rgba(255,255,255,0);
      text-align: left;
      line-height: 1.21428571em;
      font-family: system-ui,-apple-system,BlinkMacSystemFont,Helvetica,Segoe UI,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
      padding: .67857143em 1em;
      background: #fff;
      border: 1px solid rgba(34,36,38,.15);
      color: rgba(0,0,0,.87);
      border-radius: .21428571rem;
      transition: box-shadow .1s ease,border-color .1s ease;
      box-shadow: none;
      outline-color: rgba(0, 0, 0, 0.87);
    }
  
    #road-embed-map .road-embed-map-sidebar {
        height: 100%;
        width: 350px;
        position: absolute;
        z-index: 10002;
        top: 0;
        left: -350px;
        background-color: rgb(27, 28, 29);
        color: rgba(255, 255, 255, 0.9);
        overflow-y: auto;
        transition: left .5s ease 0s;
        font-size: 0.875rem;
        font-family: "Exo 2", system-ui, -apple-system, BlinkMacSystemFont, Helvetica, Segoe UI, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji;
      }
  
      #road-embed-map .road-embed-map-error {
        width: 100%;
        z-index: 10003;
        border-radius: .21428571rem;
        box-shadow: rgb(224, 180, 180) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px;
        font-size: 1em;
        padding: 1em 1.5em;
        line-height: 1.4285em;
        background-color: #fff6f6;
        color: #9f3a38;
        top: 0;
        position: absolute;
        opacity: 0;
        transition: opacity .1s ease;
        display: none;
        cursor: pointer;
      }
  
      #road-embed-map .road-embed-map-search::placeholder {
        opacity: 0.7;
        color: #999;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container {
        padding-left: 1em; 
        padding-right: 1em;
        opacity: 0;
        transition: opacity .1s ease;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container h3 {
        font-size: 1.125rem;
        font-size: 18px;
        margin: 1rem 0;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container h4 {
        font-size: 0.9375rem;
        margin: 1rem 0;
        padding: 0;
        font-weight: 700;
        line-height: 1.28571429em;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container table {
        width: 100%; 
        font-size: 0.875rem;
        margin: 1em 0;
        border-radius: .21428571rem;
        text-align: left;
        border-collapse: separate;
        border-spacing: 0;
        background-color: rgb(51, 51, 51);
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container table td {
        transition: background .1s ease,color .1s ease;
        padding: .78571429em;
        background: hsla(0,0%,100%,.02);
        border-collapse: separate;
        border-color: hsla(0,0%,100%,.1) !important;
        border-bottom-color: rgba(255, 255, 255, 0.1);
        border-right-color: rgba(255, 255, 255, 0.1);
        border-top-color: rgba(255, 255, 255, 0.1);
        border-top-style: solid;
        border-top-width: 1px;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container table .inverted {
        background: #333;
        color: hsla(0,0%,100%,.9);
        border: none;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container table .inverted td {
        border-color: hsla(0,0%,100%,.1) !important;
        background-color: rgba(255, 255, 255, 0.02);
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container table td:first-child {
        background: hsla(0,0%,100%,.02);
        color: #fff;
        font-weight: 700;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container table td:nth-child(2) {
        border-left: 1px solid rgba(34,36,38,.15);
        border-left-color: rgba(34, 36, 38, 0.15);
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container .label {
        margin-left: 0;
        margin-right: .28571429em;
        font-size: .85714286rem;
        display: inline-block;
        line-height: 1;
        vertical-align: baseline;
        margin: .14285714em;
        background-color: #e8e8e8;
        background-image: none;
        padding: .5833em .833em;
        color: rgba(0,0,0,.6);
        text-transform: none;
        font-weight: 700;
        border: 0 solid transparent;
        border-radius: .21428571rem;
        transition: background .1s ease;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container .label.olive {
        background-color: #77a741 !important;
        border-color: #77a741 !important;
        color: #fff !important;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container .label.blue {
        background-color: #2185d0 !important;
        border-color: #2185d0 !important;
        color: #fff !important;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container .label.grey {
        background-color: #767676 !important;
        border-color: #767676 !important;
        color: #fff !important;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container .label.red {
        background-color: #db2828 !important;
        border-color: #db2828 !important;
        color: #fff !important;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container a.directions {
        background-color: rgb(247, 150, 31);
        box-shadow: inset 0 0 0 0 rgba(34,36,38,.15);
        color: #fff;
        text-shadow: none;
        background-image: none;
        display: block;
        width: 100%;
        background: #f7931e none;
        cursor: pointer;
        display: inline-block;
        min-height: 1em;
        outline: none;
        border: none;
        padding: .78571429em 0;
        margin-bottom: 1em;
        text-transform: none;
        font-weight: 700;
        line-height: 1em;
        font-style: normal;
        text-align: center;
        text-decoration: none;
        border-radius: .21428571rem;
        user-select: none;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container a.directions span {
        position: relative;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container svg {
        margin-right: 0.5em;
        width: 20px;
        display: inline;
        position: relative;
        top: 5px;
      }
  
      #road-embed-map .road-embed-map-sidebar .sidebar-container a.directions svg {
        position: absolute;
        left: -1.125rem;
        top: 0.125rem;
        width: 0.8125rem;
        height: 0.8125rem;
        fill: #fff;
      }
  
      #road-embed-map .road-embed-map-sidebar .divider:not(.vertical):not(.horizontal) {
        border-top: 1px solid rgba(34,36,38,.15);
        border-bottom: 1px solid hsla(0,0%,100%,.1);
      }
  
      #road-embed-map .road-embed-map-sidebar .divider {
        border-color: transparent !important;
        font-size: 1rem;
        margin: 1rem 0;
        line-height: 1;
        height: 0;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .05em;
        color: rgba(0,0,0,.85);
        user-select: none;
      }
    `;
  
    const locationAvailableSvg = window.btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <circle cx="120" cy="120" opacity="1" r="50" fill="#006600" stroke="white" stroke-width="12" />
    </svg>`);
    const locationAvailableHoverSvg = window.btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <circle cx="120" cy="120" opacity="1" r="70" fill="#006600" stroke="white" stroke-width="20" />
    </svg>`);
    const locationUnavailableSvg = window.btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <circle cx="120" cy="120" opacity="1" r="50" fill="#CC0000" stroke="white" stroke-width="12" />
    </svg>`);
    const locationUnavailableHoverSvg = window.btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <circle cx="120" cy="120" opacity="1" r="70" fill="#CC0000" stroke="white" stroke-width="20" />
    </svg>`);
    const locationChargingSvg = window.btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <circle cx="120" cy="120" opacity="1" r="50" fill="#0000CC" stroke="white" stroke-width="12" />
    </svg>`);
    const locationChargingHoverSvg = window.btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <circle cx="120" cy="120" opacity="1" r="70" fill="#0000CC" stroke="white" stroke-width="20" />
    </svg>`);
    const locationUnknownSvg = window.btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <circle cx="120" cy="120" opacity="1" r="50" fill="#666666" stroke="white" stroke-width="12" />
    </svg>`);
    const locationUnknownHoverSvg = window.btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <circle cx="120" cy="120" opacity="1" r="70" fill="#666666" stroke="white" stroke-width="20" />
    </svg>`);
    const clusterSvg = window.btoa(`
        <svg fill="#1978c8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
          <circle cx="120" cy="120" opacity="1" r="90" />
        </svg>`);
    const carSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><path d="M499.99 176h-59.87l-16.64-41.6C406.38 91.63 365.57 64 319.5 64h-127c-46.06 0-86.88 27.63-103.99 70.4L71.87 176H12.01C4.2 176-1.53 183.34.37 190.91l6 24C7.7 220.25 12.5 224 18.01 224h20.07C24.65 235.73 16 252.78 16 272v48c0 16.12 6.16 30.67 16 41.93V416c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h256v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-54.07c9.84-11.25 16-25.8 16-41.93v-48c0-19.22-8.65-36.27-22.07-48H494c5.51 0 10.31-3.75 11.64-9.09l6-24c1.89-7.57-3.84-14.91-11.65-14.91zm-352.06-17.83c7.29-18.22 24.94-30.17 44.57-30.17h127c19.63 0 37.28 11.95 44.57 30.17L384 208H128l19.93-49.83zM96 319.8c-19.2 0-32-12.76-32-31.9S76.8 256 96 256s48 28.71 48 47.85-28.8 15.95-48 15.95zm320 0c-19.2 0-48 3.19-48-15.95S396.8 256 416 256s32 12.76 32 31.9-12.8 31.9-32 31.9z"/></svg>`;
  
    const ICON_EVSE = `<?xml version="1.0" encoding="utf-8"?>
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             viewBox="0 0 600 600" enable-background="new 0 0 600 600" xml:space="preserve">
    <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="M348.228,586.285H65V40.961c0-12.037,9.848-21.881,21.881-21.881
            h239.466c12.033,0,21.881,9.844,21.881,21.881v249.208h28.541c25.861,0,37.966,20.842,37.966,44.639v180.34
            c0.196,7.04,3.733,10.31,10.186,10.295c9.012,0,6.295,0,15.311,0c6.551,0.076,9.919-3.808,10.186-10.31
            c-0.106-91.637-0.233-241.615-0.233-333.209l68.969-48.134L540,163.844l-53.266,37.173l0.274,314.422
            c0.365,23.694-14.855,46.587-39.919,46.595c-13.584,0-15.436,0-29.023,0c-25.065,0-40.285-22.901-39.92-46.595V333.901
            c0.166-4.173-1.765-6.683-6.288-7.146h-23.63V586.285L348.228,586.285z M133.566,83.214c-3.375,0-6.137,2.762-6.137,6.137v146.095
            c0,3.379,2.762,6.141,6.137,6.141h146.095c3.379,0,6.141-2.762,6.141-6.141V89.351c0-3.375-2.762-6.137-6.141-6.137H133.566
            L133.566,83.214z M223.038,107.917l-31.461-0.023l-21.252,66.52l35.991-0.049l-12.711,42.542l14.381-0.004l34.919-69.379
            l-34.246-0.068L223.038,107.917z"/>
    </svg>
    `;
  
    const ICON_IEC_62196_T2 = `<?xml version="1.0" encoding="utf-8"?>
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             viewBox="0 0 600 600" enable-background="new 0 0 600 600" xml:space="preserve">
    <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="M353.286,163.919c16.464,0,29.815,13.351,29.815,29.822
            c0,16.467-13.351,29.819-29.815,29.819c-16.47,0-29.822-13.352-29.822-29.819C323.464,177.27,336.816,163.919,353.286,163.919
            L353.286,163.919z M245.838,163.919c16.47,0,29.822,13.351,29.822,29.822c0,16.467-13.352,29.819-29.822,29.819
            c-16.471,0-29.822-13.352-29.822-29.819C216.016,177.27,229.367,163.919,245.838,163.919L245.838,163.919z M354.093,338.178
            c22.575,0,40.874,18.299,40.874,40.87c0,22.571-18.299,40.87-40.874,40.87c-22.568,0-40.867-18.299-40.867-40.87
            C313.226,356.477,331.525,338.178,354.093,338.178L354.093,338.178z M245.024,338.178c22.575,0,40.874,18.299,40.874,40.87
            c0,22.571-18.299,40.87-40.874,40.87c-22.568,0-40.874-18.299-40.874-40.87C204.151,356.477,222.457,338.178,245.024,338.178
            L245.024,338.178z M406.906,244.769c22.575,0,40.874,18.299,40.874,40.87s-18.299,40.87-40.874,40.87
            c-22.568,0-40.867-18.299-40.867-40.87S384.338,244.769,406.906,244.769L406.906,244.769z M192.211,244.769
            c22.568,0,40.874,18.299,40.874,40.87s-18.306,40.87-40.874,40.87c-22.575,0-40.874-18.299-40.874-40.87
            S169.636,244.769,192.211,244.769L192.211,244.769z M299.559,244.769c22.575,0,40.874,18.299,40.874,40.87
            s-18.299,40.87-40.874,40.87c-22.569,0-40.868-18.299-40.868-40.87S276.99,244.769,299.559,244.769L299.559,244.769z
             M452.99,131.334H146.127c-32.625,37.291-50.332,84.551-50.332,134.107c0,112.541,91.226,203.765,203.764,203.765
            c112.544,0,203.764-91.223,203.764-203.765C503.323,215.889,485.608,168.622,452.99,131.334L452.99,131.334z M471.276,105.109
            l-4.672-4.998h-334.09l-4.672,4.998c-40.739,43.6-63.267,100.662-63.267,160.332c0,129.775,105.21,234.988,234.984,234.988
            c129.774,0,234.984-105.213,234.984-234.988C534.542,205.771,512.015,148.709,471.276,105.109L471.276,105.109z M480.204,60.027
            H118.914C61.952,110.158,26,183.596,26,265.441C26,416.523,148.48,539,299.559,539c151.085,0,273.558-122.477,273.558-273.559
            C573.117,183.596,537.165,110.158,480.204,60.027z"/>
    </svg>
    `;
    const ICON_IEC_62196_T2_COMBO = `<?xml version="1.0" encoding="utf-8"?>
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             viewBox="0 0 600 600" enable-background="new 0 0 600 600" xml:space="preserve">
    <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="M228.887,396.793c20.779,0,37.62,16.841,37.62,37.617
            c0,20.773-16.841,37.617-37.62,37.617c-20.773,0-37.613-16.844-37.613-37.617C191.274,413.634,208.115,396.793,228.887,396.793
            L228.887,396.793z M366.03,396.793c20.773,0,37.614,16.841,37.614,37.617c0,20.773-16.841,37.617-37.614,37.617
            c-20.779,0-37.62-16.844-37.62-37.617C328.41,413.634,345.251,396.793,366.03,396.793L366.03,396.793z M228.375,325.684
            c-29.03,0-55.41,11.868-74.52,30.976c-41.566,41.573-41.566,113.923,0,155.497c19.111,19.111,45.49,30.979,74.52,30.979h138.168
            c29.023,0,55.41-11.868,74.521-30.979c41.565-41.566,41.565-113.928,0-155.497c-18.336-18.336-43.379-30.003-71.019-30.916
            c63.723-27.868,105.151-90.836,105.151-160.733c0-42.14-13.276-74.632-37.316-108.359H161.794
            c-24.033,33.747-37.309,66.2-37.309,108.359c0,69.852,41.359,132.758,105.012,160.674H228.375L228.375,325.684z M366.543,357.791
            H228.375c-20.163,0-38.513,8.265-51.824,21.569c-29.023,29.027-29.023,81.069,0,110.096c13.311,13.308,31.654,21.569,51.824,21.569
            h138.168c20.17,0,38.513-8.261,51.824-21.569c29.023-29.027,29.023-81.069,0-110.096
            C405.056,366.057,386.706,357.791,366.543,357.791L366.543,357.791z M421.17,88.762c14.523,23.018,21.915,49.024,21.915,76.248
            c0,79.121-64.131,143.245-143.248,143.245S156.595,244.127,156.595,165.01c0-27.234,7.392-53.222,21.915-76.248H421.17
            L421.17,88.762z M331.075,225.95c11.726,0,21.236,9.511,21.236,21.236c0,11.733-9.511,21.24-21.236,21.24
            c-11.733,0-21.236-9.507-21.236-21.24C309.839,235.461,319.342,225.95,331.075,225.95L331.075,225.95z M268.605,225.95
            c11.726,0,21.243,9.511,21.243,21.236c0,11.733-9.518,21.24-21.243,21.24c-11.726,0-21.236-9.507-21.236-21.24
            C247.369,235.461,256.879,225.95,268.605,225.95L268.605,225.95z M236.882,163.754c11.726,0,21.243,9.508,21.243,21.236
            c0,11.729-9.518,21.24-21.243,21.24c-11.726,0-21.236-9.511-21.236-21.24C215.646,173.261,225.156,163.754,236.882,163.754
            L236.882,163.754z M299.837,163.754c11.732,0,21.243,9.508,21.243,21.236c0,11.729-9.511,21.24-21.243,21.24
            c-11.726,0-21.236-9.511-21.236-21.24C278.6,173.261,288.111,163.754,299.837,163.754L299.837,163.754z M362.798,163.754
            c11.726,0,21.236,9.508,21.236,21.236c0,11.729-9.511,21.24-21.236,21.24c-11.733,0-21.236-9.511-21.236-21.24
            C341.562,173.261,351.065,163.754,362.798,163.754L362.798,163.754z M332.079,116.228c6.86,0,12.417,5.561,12.417,12.417
            c0,6.86-5.558,12.425-12.417,12.425s-12.424-5.566-12.424-12.425C319.654,121.79,325.219,116.228,332.079,116.228L332.079,116.228z
             M267.601,116.228c6.86,0,12.425,5.561,12.425,12.417c0,6.86-5.565,12.425-12.425,12.425c-6.86,0-12.417-5.566-12.417-12.425
            C255.184,121.79,260.742,116.228,267.601,116.228L267.601,116.228z M177.153,7.87C129.219,7.87,90,47.086,90,95.02v408.83
            c0,47.934,39.219,87.15,87.153,87.15h246.024c47.934,0,87.147-39.216,87.147-87.15V95.02c0-47.934-39.213-87.15-87.147-87.15
            H177.153z"/>
    </svg>
    `;
    const ICON_IEC_62196_T1 = `<?xml version="1.0" encoding="utf-8"?>
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             viewBox="0 0 600 600" enable-background="new 0 0 600 600" xml:space="preserve">
    <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="M407.111,334.214c16.317,0,29.543,13.226,29.543,29.543
            c0,16.313-13.227,29.543-29.543,29.543c-16.31,0-29.536-13.229-29.536-29.543C377.576,347.44,390.802,334.214,407.111,334.214
            L407.111,334.214z M198.69,334.214c16.317,0,29.543,13.226,29.543,29.543c0,16.313-13.226,29.543-29.543,29.543
            s-29.543-13.229-29.543-29.543C169.147,347.44,182.373,334.214,198.69,334.214L198.69,334.214z M227.94,180.772
            c24.971,0,45.213,20.242,45.213,45.213c0,24.967-20.243,45.213-45.213,45.213s-45.213-20.245-45.213-45.213
            C182.727,201.014,202.969,180.772,227.94,180.772L227.94,180.772z M377.868,180.772c24.968,0,45.213,20.242,45.213,45.213
            c0,24.967-20.245,45.213-45.213,45.213c-24.974,0-45.213-20.245-45.213-45.213C332.655,201.014,352.894,180.772,377.868,180.772
            L377.868,180.772z M302.899,361.142c24.974,0,45.22,20.243,45.22,45.213s-20.245,45.213-45.22,45.213
            c-24.968,0-45.21-20.243-45.21-45.213S277.931,361.142,302.899,361.142L302.899,361.142z M302.899,100.142
            c-111.485,0-201.855,90.37-201.855,201.858c0,111.489,90.37,201.859,201.855,201.859c111.491,0,201.865-90.37,201.865-201.859
            C504.764,190.512,414.391,100.142,302.899,100.142L302.899,100.142z M302.899,69.21C174.338,69.21,70.113,173.44,70.113,302
            c0,128.561,104.226,232.79,232.787,232.79c128.56,0,232.793-104.229,232.793-232.79C535.692,173.44,431.459,69.21,302.899,69.21
            L302.899,69.21z M302.899,31C153.234,31,31.902,152.328,31.902,302c0,149.669,121.331,271,270.997,271
            c149.672,0,271.006-121.331,271.006-271C573.906,152.328,452.571,31,302.899,31z"/>
    </svg>
    `;
    const ICON_IEC_62196_T1_COMBO = `<?xml version="1.0" encoding="utf-8"?>
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             viewBox="0 0 600 600" enable-background="new 0 0 600 600" xml:space="preserve">
    <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="M246.063,132.777c18.959,0,34.335,15.373,34.335,34.332
            c0,18.965-15.376,34.335-34.335,34.335c-18.961,0-34.332-15.37-34.332-34.335C211.731,148.15,227.102,132.777,246.063,132.777
            L246.063,132.777z M357.555,132.777c18.962,0,34.332,15.373,34.332,34.332c0,18.962-15.37,34.335-34.332,34.335
            c-18.961,0-34.331-15.373-34.331-34.335C323.224,148.15,338.594,132.777,357.555,132.777L357.555,132.777z M226.875,253.708
            c9.286,0,16.811,7.525,16.811,16.808c0,9.286-7.525,16.811-16.811,16.811c-9.283,0-16.808-7.525-16.808-16.811
            C210.066,261.234,217.592,253.708,226.875,253.708L226.875,253.708z M371.359,253.708c9.286,0,16.815,7.525,16.815,16.808
            c0,9.286-7.529,16.811-16.815,16.811c-9.279,0-16.808-7.525-16.808-16.811C354.552,261.234,362.08,253.708,371.359,253.708
            L371.359,253.708z M236.304,421.639c19.179,0,34.731,15.548,34.731,34.731c0,19.179-15.552,34.731-34.731,34.731
            c-19.179,0-34.731-15.552-34.731-34.731C201.573,437.187,217.126,421.639,236.304,421.639L236.304,421.639z M362.924,421.639
            c19.179,0,34.728,15.548,34.728,34.731c0,19.179-15.549,34.731-34.728,34.731c-19.186,0-34.735-15.552-34.735-34.731
            C328.189,437.187,343.738,421.639,362.924,421.639L362.924,421.639z M235.828,355.985c-26.801,0-51.159,10.958-68.804,28.6
            c-38.377,38.383-38.377,105.184,0,143.567c17.645,17.645,42.004,28.602,68.804,28.602h127.568c26.803,0,51.159-10.957,68.804-28.602
            c38.377-38.377,38.377-105.19,0-143.567c-16.91-16.91-39.994-27.679-65.481-28.542c57.148-25.011,97.033-82.036,97.033-148.405
            c0-88.133-70.984-161.938-161.945-161.938c-90.131,0-161.935,73.009-161.935,161.938c0,66.315,39.821,123.302,96.895,148.348
            H235.828L235.828,355.985z M159.969,344.666c-6.378,4.464-12.357,9.488-17.866,14.999c-52.137,52.134-52.137,141.271-0.003,193.407
            C167.008,577.982,200.589,592,235.828,592h127.568c35.24,0,68.823-14.018,93.729-38.927c52.137-52.134,52.137-141.276,0-193.41
            c-4.761-4.761-9.874-9.155-15.287-13.143c36.523-36.834,57.159-86.685,57.159-138.883c0-108.993-88.188-197.184-197.19-197.184
            c-108.977,0-197.181,88.207-197.181,197.184C104.627,258.933,124.557,307.996,159.969,344.666L159.969,344.666z M363.396,385.629
            H235.828c-18.617,0-35.559,7.631-47.846,19.914c-26.797,26.8-26.797,74.85,0,101.65c12.287,12.286,29.225,19.914,47.846,19.914
            h127.568c18.623,0,35.559-7.628,47.849-19.914c26.797-26.8,26.797-74.85,0-101.65C398.955,393.259,382.013,385.629,363.396,385.629
            L363.396,385.629z M301.808,75.381c-73.808,0-132.256,59.869-132.256,132.256c0,72.383,58.448,132.256,132.256,132.256
            c73.815,0,132.265-59.87,132.265-132.256C434.073,135.248,375.622,75.381,301.808,75.381L301.808,75.381z M301.808,271.807
            c13.689,0,24.784,11.098,24.784,24.781c0,13.686-11.094,24.78-24.784,24.78c-13.686,0-24.777-11.094-24.777-24.78
            C277.03,282.905,288.122,271.807,301.808,271.807z"/>
    </svg>
    `;
    const ICON_IEC_62196_T3 = `<?xml version="1.0" encoding="utf-8"?>
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             viewBox="0 0 600 600" enable-background="new 0 0 600 600" xml:space="preserve">
    <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="M460.592,75.695C501.794,116.897,525,172.38,525,230.692v136.191
            c0,58.315-23.206,113.795-64.408,154.997c-86.029,86.032-228.158,86.032-314.186,0C105.203,480.679,82,425.199,82,366.884V230.692
            c0-58.312,23.203-113.795,64.405-154.997C232.433-10.337,374.563-10.337,460.592,75.695L460.592,75.695z M434.493,101.794
            c-71.625-71.628-190.365-71.628-261.989,0c-33.068,33.068-53.597,78.696-53.597,128.898v136.191
            c0,50.205,20.529,95.834,53.597,128.898c71.624,71.628,190.364,71.628,261.989,0c33.067-33.064,53.596-78.693,53.596-128.898
            V230.692C488.089,180.49,467.56,134.862,434.493,101.794L434.493,101.794z M195.699,124.99
            c-27.134,27.137-43.982,64.557-43.982,105.702v136.191c0,41.146,16.848,78.568,43.982,105.702
            c58.806,58.814,156.791,58.814,215.598,0c27.138-27.134,43.982-64.557,43.982-105.702V230.692
            c0-41.146-16.845-78.566-43.982-105.702C352.491,66.18,254.506,66.18,195.699,124.99L195.699,124.99z M303.497,401.594
            c-17.304,0-31.334,14.029-31.334,31.337c0,17.304,14.03,31.333,31.334,31.333c17.307,0,31.337-14.029,31.337-31.333
            C334.834,415.623,320.804,401.594,303.497,401.594L303.497,401.594z M223.204,305.993c-17.308,0-31.338,14.03-31.338,31.334
            c0,17.308,14.03,31.337,31.338,31.337c17.307,0,31.337-14.029,31.337-31.337C254.541,320.023,240.511,305.993,223.204,305.993
            L223.204,305.993z M223.204,208.881c-17.308,0-31.338,14.026-31.338,31.334c0,17.307,14.03,31.337,31.338,31.337
            c17.307,0,31.337-14.03,31.337-31.337C254.541,222.907,240.511,208.881,223.204,208.881L223.204,208.881z M383.796,305.993
            c-17.308,0-31.338,14.03-31.338,31.334c0,17.308,14.03,31.337,31.338,31.337c17.307,0,31.333-14.029,31.333-31.337
            C415.129,320.023,401.103,305.993,383.796,305.993L383.796,305.993z M383.796,208.881c-17.308,0-31.338,14.026-31.338,31.334
            c0,17.307,14.03,31.337,31.338,31.337c17.307,0,31.333-14.03,31.333-31.337C415.129,222.907,401.103,208.881,383.796,208.881
            L383.796,208.881z M354.769,129.256c-12.585,0-22.786,10.201-22.786,22.786s10.2,22.786,22.786,22.786
            c12.585,0,22.786-10.201,22.786-22.786S367.354,129.256,354.769,129.256L354.769,129.256z M252.228,129.256
            c-12.585,0-22.786,10.201-22.786,22.786s10.2,22.786,22.786,22.786c12.585,0,22.786-10.201,22.786-22.786
            S264.813,129.256,252.228,129.256z"/>
    </svg>
    `;
    const ICON_SCHUKO = `<?xml version="1.0" encoding="utf-8"?>
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             viewBox="0 0 600 600" enable-background="new 0 0 600 600" xml:space="preserve">
    <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="M395.264,259.724c21.074,0,38.157,17.083,38.157,38.158
            c0,21.074-17.083,38.164-38.157,38.164c-21.075,0-38.165-17.09-38.165-38.164C357.099,276.806,374.189,259.724,395.264,259.724
            L395.264,259.724z M206.743,259.724c21.075,0,38.158,17.083,38.158,38.158c0,21.074-17.083,38.164-38.158,38.164
            c-21.074,0-38.164-17.09-38.164-38.164C168.579,276.806,185.669,259.724,206.743,259.724L206.743,259.724z M317.092,89.755v29.841
            h-32.183V89.755c-67.083,5.031-127.459,41.741-163.107,98.796v223.399c35.648,57.055,96.024,93.765,163.107,98.802v-29.841h32.183
            v29.841c67.084-5.038,127.459-41.747,163.114-98.802V188.551C444.551,131.496,384.176,94.787,317.092,89.755L317.092,89.755z
             M301,56.962c-85.858,0-165.124,45.192-209.061,118.921l-2.328,3.902v90.784H58.612v59.364h30.999v90.784l2.328,3.902
            C135.876,498.348,215.143,543.539,301,543.539c85.857,0,165.123-45.184,209.06-118.921l2.328-3.902v-90.784h31.006v-59.364h-31.006
            v-90.784l-2.328-3.902C466.124,102.147,386.857,56.962,301,56.962L301,56.962z M301,18.251c-155.741,0-282,126.253-282,282
            c0,155.741,126.26,282,282,282c155.747,0,282-126.26,282-282C583,144.504,456.747,18.251,301,18.251z"/>
    </svg>
    `;
    const ICON_CHADEMO = `<?xml version="1.0" encoding="utf-8"?>
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             viewBox="0 0 600 600" enable-background="new 0 0 600 600" xml:space="preserve">
    <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="M261.067,178.239c0,7.551,2.198,14.579,5.985,20.491l20.49-20.491
            l-20.49-20.491C263.265,163.659,261.067,170.694,261.067,178.239L261.067,178.239z M298.999,216.171
            c-7.545,0-14.58-2.198-20.488-5.981l20.488-20.491l20.491,20.491C313.581,213.972,306.55,216.171,298.999,216.171L298.999,216.171z
             M336.934,178.239c0-7.545-2.198-14.58-5.985-20.491l-20.491,20.491l20.491,20.491C334.736,192.818,336.934,185.79,336.934,178.239
            L336.934,178.239z M319.49,146.295l-20.491,20.484l-20.488-20.484c5.907-3.79,12.943-5.988,20.488-5.988
            C306.55,140.307,313.581,142.505,319.49,146.295L319.49,146.295z M298.999,124.101c29.864,0,54.141,24.281,54.141,54.138
            c0,29.864-24.277,54.145-54.141,54.145c-29.858,0-54.138-24.281-54.138-54.145C244.861,148.382,269.141,124.101,298.999,124.101
            L298.999,124.101z M261.067,417.863c0,7.551,2.198,14.579,5.985,20.491l20.49-20.491l-20.49-20.491
            C263.265,403.283,261.067,410.319,261.067,417.863L261.067,417.863z M298.999,455.795c-7.545,0-14.58-2.198-20.488-5.981
            l20.488-20.491l20.491,20.491C313.581,453.597,306.55,455.795,298.999,455.795L298.999,455.795z M336.934,417.863
            c0-7.545-2.198-14.58-5.985-20.491l-20.491,20.491l20.491,20.491C334.736,432.443,336.934,425.415,336.934,417.863L336.934,417.863z
             M319.49,385.92l-20.491,20.484l-20.488-20.484c5.907-3.79,12.943-5.988,20.488-5.988C306.55,379.931,313.581,382.13,319.49,385.92
            L319.49,385.92z M298.999,363.725c29.864,0,54.141,24.281,54.141,54.138c0,29.864-24.277,54.145-54.141,54.145
            c-29.858,0-54.138-24.281-54.138-54.145C244.861,388.007,269.141,363.725,298.999,363.725L298.999,363.725z M180.188,239.928
            c30.094,0,54.49,24.4,54.49,54.494c0,30.095-24.396,54.494-54.49,54.494c-30.095,0-54.494-24.399-54.494-54.494
            C125.694,264.327,150.093,239.928,180.188,239.928L180.188,239.928z M417.816,239.928c30.094,0,54.494,24.4,54.494,54.494
            c0,30.095-24.4,54.494-54.494,54.494c-30.095,0-54.494-24.399-54.494-54.494C363.323,264.327,387.722,239.928,417.816,239.928
            L417.816,239.928z M298.999,86.511c116.835,0,211.544,94.708,211.544,211.54c0,116.84-94.708,211.54-211.544,211.54
            c-116.836,0-211.54-94.708-211.54-211.54C87.458,181.219,182.163,86.511,298.999,86.511L298.999,86.511z M298.999,54.1
            c134.73,0,243.955,109.225,243.955,243.951c0,134.727-109.225,243.952-243.955,243.952c-134.727,0-243.952-109.225-243.952-243.952
            C55.047,163.324,164.271,54.1,298.999,54.1L298.999,54.1z M298.999,14.053C455.846,14.053,583,141.2,583,298.051
            c0,156.844-127.154,283.999-284.001,283.999C142.151,582.049,15,454.895,15,298.051C15,141.2,142.151,14.053,298.999,14.053z"/>
    </svg>
    `;
    const ICON_CATARC = `<?xml version="1.0" encoding="utf-8"?>
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             viewBox="0 0 600 600" enable-background="new 0 0 600 600" xml:space="preserve">
    <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" d="M449.833,45.125C531.521,95.36,586,185.558,586,288.497
            c0,157.672-127.825,285.497-285.503,285.497C142.822,573.994,15,446.169,15,288.497C15,185.558,69.476,95.36,151.167,45.125H449.833
            L449.833,45.125z M193.639,256.195c-29.46,0-53.343,23.89-53.343,53.35c0,29.46,23.882,53.343,53.343,53.343
            c29.46,0,53.346-23.882,53.346-53.343C246.985,280.085,223.099,256.195,193.639,256.195L193.639,256.195z M407.365,256.195
            c-29.46,0-53.35,23.89-53.35,53.35c0,29.46,23.89,53.343,53.35,53.343c29.46,0,53.343-23.882,53.343-53.343
            C460.708,280.085,436.826,256.195,407.365,256.195L407.365,256.195z M442.248,88.407l-4.308-3.053H163.052l-4.304,3.053
            c-64.954,46.088-103.49,120.43-103.49,200.09c0,135.438,109.801,245.239,245.239,245.239c135.437,0,245.245-109.801,245.245-245.239
            C545.742,208.837,507.203,134.495,442.248,88.407L442.248,88.407z M427.607,117.937H173.391
            c-54.002,40.321-85.547,103.142-85.547,170.56c0,117.449,95.204,212.656,212.653,212.656c117.455,0,212.663-95.207,212.663-212.656
            C513.16,221.08,481.609,158.258,427.607,117.937L427.607,117.937z M300.497,215.65c-11.384,0-20.614,9.226-20.614,20.613
            c0,11.387,9.23,20.614,20.614,20.614c11.387,0,20.62-9.226,20.62-20.614C321.117,224.876,311.883,215.65,300.497,215.65
            L300.497,215.65z M300.497,146.275c-11.384,0-20.614,9.226-20.614,20.614c0,11.387,9.23,20.62,20.614,20.62
            c11.387,0,20.62-9.233,20.62-20.62C321.117,155.501,311.883,146.275,300.497,146.275L300.497,146.275z M381.735,146.275
            c-11.387,0-20.613,9.226-20.613,20.614c0,11.387,9.226,20.62,20.613,20.62c11.387,0,20.613-9.233,20.613-20.62
            C402.348,155.501,393.122,146.275,381.735,146.275L381.735,146.275z M219.265,146.275c-11.387,0-20.616,9.226-20.616,20.614
            c0,11.387,9.23,20.62,20.616,20.62c11.387,0,20.617-9.233,20.617-20.62C239.882,155.501,230.652,146.275,219.265,146.275
            L219.265,146.275z M300.497,400.094c-18.881,0-34.186,15.309-34.186,34.189c0,18.887,15.305,34.189,34.186,34.189
            c18.887,0,34.189-15.302,34.189-34.189C334.686,415.403,319.384,400.094,300.497,400.094L300.497,400.094z M381.735,417.199
            c-11.387,0-20.613,9.233-20.613,20.62c0,11.38,9.226,20.614,20.613,20.614c11.387,0,20.613-9.233,20.613-20.614
            C402.348,426.433,393.122,417.199,381.735,417.199L381.735,417.199z M219.265,417.199c-11.387,0-20.616,9.233-20.616,20.62
            c0,11.38,9.23,20.614,20.616,20.614c11.387,0,20.617-9.233,20.617-20.614C239.882,426.433,230.652,417.199,219.265,417.199z"/>
    </svg>
    `;
  
    const ICONS = {
      ICON_IEC_62196_T2,
      ICON_IEC_62196_T2_COMBO,
      ICON_IEC_62196_T1,
      ICON_IEC_62196_T1_COMBO,
      ICON_IEC_62196_T3,
      ICON_CHADEMO,
      ICON_CATARC,
      ICON_SCHUKO,
      ICON_DOMESTIC_F: ICON_SCHUKO,
      ICON_DOMESTIC_E: ICON_SCHUKO,
      ICON_DOMESTIC_B: ICON_SCHUKO,
    };
  
    const StatusUnknown = 0;
    const StatusAvailable = 1;
    const StatusUnavailable = 2;
    const StatusCharging = 3;
  
    const sanitizer = document.createElement('p');
    // nettoie une chaîne de caractères potentiellement dangereuse ou non sécurisée
    function sanitize(unsafe) {
      sanitizer.innerText = unsafe
      return sanitizer.innerHTML;
    }
  
    // ajoute une majuscule au début de chaque chaine de caractère
    function startCase(str) {
      if (!str) return '';
      return str.replace(/\W+/g, ' ')
                .replace(/_+/g, ' ')
                .replace(/\s+/g, ' ')
                .split(' ')
                .map(function(chunk){
                  return chunk.charAt(0).toUpperCase() + chunk.slice(1);
                }).join(' ');
    }
  
    // ajoute une majuscule au début de chaque mot et met en minuscule le reste du mot
    function titleize(str) {
      return str
        .toLowerCase()
        .replace('_', ' ')
        .split(' ')
        .map((word) => startCase(word))
        .join(' ');
    }
  
    // définie la couleur en fonction du status
    function colorForStatus(status) {
      if (status === 'CHARGING') return 'blue';
      if (status === 'AVAILABLE') return 'olive';
      if (status === 'NOT_AVAILABLE') return 'red';
      if (status === 'UNAVAILABLE') return 'red';
      if (status === 'SUSPENDEDEV') return 'yellow';
      if (status === 'UNKNOWN') return 'grey';
      return undefined;
    };
  
    // definie la couleur en fonciton du status
    function colorForMinorStatus(status, minorStatus) {
      if (minorStatus === 'CHARGING') return 'blue';
      if (minorStatus === 'AVAILABLE') return 'olive';
      if (minorStatus === 'NOT_AVAILABLE') return 'red';
      return '';
    };
  
    // associe un label a une couleur
    function labelForStatus(status) {
      if (status === 'CHARGING') return 'Charging';
      if (status === 'AVAILABLE') return 'Available';
      if (status === 'NOT_AVAILABLE') return 'Not Available';
      if (status === 'UNAVAILABLE') return 'Not Available';
      if (status === 'SUSPENDEDEV') return 'Suspended EV';
      if (status === 'UNKNOWN') return 'Unknown';
      return status;
    };
  
    // modifie et associe le nom/type du connecteur
    function formatConnectorType(value) {
      if (value === 'IEC_62196_T1') return 'Type 1';
      if (value === 'IEC_62196_T1_COMBO') return 'Type 1 Combo';
      if (value === 'IEC_62196_T2') return 'Type 2';
      if (value === 'IEC_62196_T2_COMBO') return 'Type 2 Combo';
      if (value === 'IEC_62196_T3A') return 'Type 3A';
      if (value === 'IEC_62196_T3C') return 'Type 3C';
      if (value === 'CHADEMO') return 'CHAdeMO';
      if (value === 'DOMESTIC_F') return 'Domestic F';
      if (value === 'DOMESTIC_E') return 'Domestic E';
      if (value === 'DOMESTIC_B') return 'Domestic B';
      if (value === 'CATARC') return 'Catarc';
      return value;
    };
  
    // prend un objet location en entrée et génère une liste de tags basée sur différentes propriétés de cet objet
    function formatLocationFacilities(location) {
      const tags = [];
      if (location.charging_when_closed) {
        tags.push(`After-hours Charging`);
      }
      const { opening_times } = location;
      if (opening_times && opening_times.twentyfourseven) {
        tags.push(`24/7`);
      }
      const { capabilities } = location;
      if (capabilities && capabilities.includes('RESERVABLE')) {
        tags.push('Reservable');
      }
      if (capabilities && capabilities.includes('RFID_READER')) {
        tags.push('RFID');
      }
      if (capabilities && capabilities.includes('CREDIT_CARD_PAYABLE')) {
        tags.push('Credit Card');
      }
      const { energy_mix } = location;
      if (energy_mix && energy_mix.is_green_energy) {
        tags.push('Green Energy');
      }
      const { parking_type } = location;
      if (parking_type) {
        tags.push(titleize(parking_type));
      }
      const { type } = location;
      if (type && type !== parking_type) {
        tags.push(titleize(type));
      }
      const { facilities } = location;
      if (facilities) {
        facilities.forEach((facility) => {
          tags.push(titleize(facility));
        });
      }
      return tags;
    };
  
    // prend un nombre en entrée et retourne une version de ce nombre avec des points comme séparateurs de milliers
    function numberWithDots(x) {
      if (!x) return '0';
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
  
    // crée un objet currencyToSymbolMap qui associe des symboles de devise à des codes de devise
    const currencyToSymbolMap = {
      'EUR': '\u20ac',
      'DKK': 'Dkr',
    };
  
    // prend un code de devise en entrée et renvoie le symbole de la devise correspondante s'il est présent dans currencyToSymbolMap
    function currencyToSymbol(currency){
      if (!currency) {
        return currency;
      }
      return currencyToSymbolMap[currency.toUpperCase()] || `${currency} `;
    };
  
    // arrondit un nombre à un nombre spécifié de décimales
    function round(value, decimals) {
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
  
    // formate une valeur numérique en une chaîne de caractères représentant une valeur monétaire
    function formatCurrency(value, { precision = 2, thousandSep = false, currency = ''} = {}){
      if (isNaN(value)) return '-';
  
      let formatted = round(value, precision).toFixed(precision).replace('.', ',');
      if (thousandSep) {
        formatted = numberWithDots(formatted);
      }
      currency = currency || '';
      return `${currencyToSymbol(currency)}${formatted}`;
    };
  
    // initialise une carte routière en fonction des paramètres fournis
    async function initRoadMap(params) {
      // Initialise les paramètres par défaut s'ils ne sont pas fournis
      params = params || {};
      // Définit la position initiale de la carte
      let position = params.position || initialPosition;
      // Définit le niveau de zoom initial de la carte
      const zoomLevel = params.zoomLevel || initialZoomLevel;
      // Détermine si la localisation du navigateur doit être utilisée
      const useBrowserLocation = params.useBrowserLocation || false;
    
      // Si l'utilisation de la localisation du navigateur est activée
      if (useBrowserLocation) {
        // Vérifie si la fonctionnalité de géolocalisation est disponible dans le navigateur
        if (window.navigator.geolocation) {
          // Fonction asynchrone pour récupérer la position actuelle de l'utilisateur
  
          const fetchLocation = async function() {
            return new Promise(function(resolve, reject) {
              navigator.geolocation.getCurrentPosition(resolve, reject)
            });
          };
  
          try {
            // Récupère la position actuelle de l'utilisateur
            const geolocation = await fetchLocation();
            // Met à jour la position de la carte avec les coordonnées de l'utilisateur
            position = {
              lat: geolocation.coords.latitude,
              lng: geolocation.coords.longitude
            };
          } catch (e) {
            // En cas d'erreur lors de la récupération de la position, ignore l'erreur
            console.log('erreur')
          }
        }
      }
    
      // Initialise le client RoadClient
      const roadClient = new RoadClient(userToken);
    
      // Charge les polices CSS nécessaires
      loadCSSFonts();
    
      // Crée et ajoute un élément <style> contenant du CSS personnalisé à la page
      const style = document.createElement('style');
      style.innerHTML = css;
      widget.appendChild(style);
    
      // Crée un script Google Maps en fonction des paramètres fournis
      const created = createGoogleScriptElement({
        token: userToken,
        googleApiKey: googleApiKey,
      });
    
      // Si le script Google Maps a été créé avec succès
      if (created) {
        // Définit une fonction d'initialisation de la carte dans la fenêtre globale
        window.initMap = () => initGoogleMap(roadClient, position, zoomLevel);
        return;
      }
    
      // Initialise la carte Google Maps avec le client RoadClient, la position et le niveau de zoom
      initGoogleMap(roadClient, position, zoomLevel);
    }
    
    // affiche un message d'erreur sur la page en modifiant le contenu et les propriétés CSS de l'élément errorMessage
    function showError(error) {
      errorMessage.innerHTML = error;
      errorMessage.style.display = 'block';
      errorMessage.style.opacity = 1;
    }
  
    // fournit des fonctionnalités pour effectuer des requêtes vers une API Road.io
    class RoadClient {
      apiURL = baseUrl;
      // a partir de ce base url il faut que j'essaie de comprendre le fonctionnement de sidebar et le reproduire
  
      constructor(token) {
        this.token = token;
        this.abort = new AbortController();
        this.timeout = null;
      }
  
      _token;
  
      get token() {
        return this._token;
      }
  
      set token(token) {
        if (!token) {
          throw new Error("No valid Road.io token provided");
        }
  
        this._token = token;
      }
  
      async request(options) {
        if (this.timeout) {
          clearTimeout(this.timeout);
          this.timeout = null
        }
        this.abort.abort();
        this.abort = new AbortController();
        const signal = this.abort.signal;
        try {
          const reqURL = `${this.apiURL}${options.path}`;
          const token = this.token;
          const perform = new Promise(function(resolve, reject) {
            this.timeout = setTimeout(function() {
              fetch(reqURL, {
                signal,
                method: options.method || "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }).then(resolve).catch(reject);
            }, 500);
          }.bind(this))
          const response = await perform;
          switch (response.status) {
          case 200:
            return response.json();
          case 400:
            throw new Error('Bad request');
          case 404:
            throw new Error('Not Found');
          case 500:
            throw new Error('Server Error');
          case 503:
            throw new Error('Timeout!');
          default:
            throw new Error(`Unexpected status: ${response.status}`);
          }
        } catch (e) {
          if (e instanceof DOMException) {
            return null;
          }
          throw e;
        }
      }
  
      // récupère les bornes de recharges
      // url complet : https://map.road.io/api/v1/locations?zoom=14&nwLat=48.090944022644656&nwLng=-0.8150174373535246&seLat=48.050280544581774&seLng=-0.7309033626464934&generation=2
      async fetchLocations(params) {
        return await this.request({
          path: `/api/v1/locations?${new URLSearchParams(params).toString()}`,
        });
      }
  
      // url complet : https://map.road.io/api/v1/locations/details?lat=48.076943&lng=-0.752428
      async fetchLocationDetails({lat, lng}) {
        return await this.request({
          path: `/api/v1/locations/details?${new URLSearchParams({lat, lng}).toString()}`
        });
      }
    }
  
    // faciliter le chargement de l'API Google Maps JavaScript en ajoutant dynamiquement un élément <script> au document HTML
    function createGoogleScriptElement(params) {
      const scripts = document.head.querySelectorAll('script');
      for (const script of scripts) {
        if (script.src.startsWith('https://maps.googleapis.com/maps/api/js')) return false;
      }
  
      const scriptElement = document.createElement("script");
      scriptElement.setAttribute("async", "");
      scriptElement.setAttribute("defer", "");
  
      scriptElement.setAttribute(
        "src",
        `https://maps.googleapis.com/maps/api/js?key=${params.googleApiKey}&callback=initMap&libraries=places`
      );
  
      document.head.prepend(scriptElement);
      return true;
    }
  
    // TODO inline css fonts under custom family so that they dont polute customer site. ex map-widget font fam.
    // charger des polices de caractères depuis Google Fonts en ajoutant dynamiquement des balises <link> au document HTML
    function loadCSSFonts() {
      const fonts = [
        'https://fonts.googleapis.com/css?family=Google+Sans+Text:400&amp;text=%E2%86%90%E2%86%92%E2%86%91%E2%86%93&amp;lang=en',
        'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Google+Sans:400,500,700|Google+Sans+Text:400&amp;lang=en'
  
      ];
      for (const font of fonts) {
        const link = document.createElement("link");
        link.setAttribute('href', font);
        link.setAttribute('type', 'text/css');
        link.setAttribute('rel', 'stylesheet');
        document.head.appendChild(link);
      }
    }
  
    // responsable de l'initialisation de la carte Google Maps sur la page web
    async function initGoogleMap(roadClient, position, zoomLevel) {
      search = document.createElement('input');
      search.setAttribute("class", "road-embed-map-search");
      search.setAttribute("placeholder", "Rechercher..")
      search.setAttribute("type", "text");
      widget.appendChild(search);
  
      const mapContainer = document.createElement('div');
      widget.appendChild(mapContainer);
      mapContainer.setAttribute("class", "road-embed-map-container")
      mapContainer.style = {
        position: 'relative',
        overflow: 'hidden',
      }
      mapContainer.style.height = '100%';
      map = new google.maps.Map(
        mapContainer,
        {
          zoom: zoomLevel,
          center: new google.maps.LatLng(position.lat, position.lng),
          mapTypeControl: false,
          fullscreenControl: false
        }
      );
  
      
      widget.appendChild(errorMessage);
      errorMessage.addEventListener('click', hideErrorMessage);
  
      
  
      const tilesLoaded = google.maps.event.addListener(map, 'tilesloaded', function() {
        google.maps.event.removeListener(tilesLoaded);
        refreshLocations(map, roadClient);
      });
      google.maps.event.addListener(map, 'dragend', function() {
        refreshLocations(map, roadClient);
      });
      google.maps.event.addListener(map, 'zoom_changed', function() {
        refreshLocations(map, roadClient);
      });
      
      // Récupérer les éléments input1 et input2
      var input1 = document.getElementById("from");
      var input2 = document.getElementById("to");
  
      // Create autocomplete objects for all inputs
      var options = {
        types: ['address'], // Limiter les suggestions aux adresses
        componentRestrictions: { country: 'fr' } // Limiter les suggestions à la France
      };
  
      
      // Créer une instance d'Autocomplete pour input1
      var autocomplete1 = new google.maps.places.Autocomplete(input1, options);
  
      // Créer une instance d'Autocomplete pour input2
      var autocomplete2 = new google.maps.places.Autocomplete(input2, options);
  
      autocomplete = new google.maps.places.Autocomplete(search, {
        fields: ["geometry"],
      });
      autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        if (!place) {
          return;
        }
        map.setCenter(place.geometry.location);
        refreshLocations(map, roadClient);
      });
  
      search.addEventListener('focus', clearSearch);
    }
  
    // cache le message d'erreur
    function hideErrorMessage() {
      errorMessage.style.display = 'none';
    }
  
    // vide le champ de recherche
    function clearSearch() {
      search.value = '';
    }
  
    // prend un objet de position contenant les coordonnées latitude (lat) et longitude (lng) et retourne une clé unique basée sur ces coordonnées
    function positionToKey({lat, lng}) {
      return `lat:${lat}-lng:${lng}`;
    }
  
    // prend en paramètres un objet markers contenant des marqueurs et leur génération associée, ainsi que la génération actuelle. Elle actualise l'affichage des marqueurs en fonction de leur génération.
    function refreshMarkers(markers, currentGeneration) {
      const forRemoval = [];
    
      // Parcours de chaque marqueur dans l'objet 'markers'
      for (const key in markers) {
        const {marker, generation} = markers[key];
    
        // Vérification si la génération du marqueur est différente de la génération actuelle
        if (generation !== currentGeneration) {
          // Ajout du marqueur à la liste des marqueurs à supprimer
          forRemoval.push(key);
          
          // Masquage du marqueur sur la carte en le rendant invisible
          marker.setVisible(false);
          
          // Poursuite à l'itération suivante de la boucle
          continue;
        }
    
        // Si la génération du marqueur correspond à la génération actuelle, le marqueur reste visible sur la carte
        marker.setVisible(true);
      }
    
      // Suppression des marqueurs obsolètes
      for (const r of forRemoval) {
        // Effacement des écouteurs d'événements associés au marqueur pour éviter les fuites de mémoire
        google.maps.event.clearListeners(markers[r].marker, 'mouseover');
        google.maps.event.clearListeners(markers[r].marker, 'mouseout');
        google.maps.event.clearListeners(markers[r].marker, 'click');
        
        // Retrait du marqueur de la carte
        markers[r].marker.setMap(null);
        
        // Suppression de l'entrée correspondante de l'objet 'markers'
        delete markers[r];
      }
    }
    
    // effectue plusieurs opérations liées à la mise à jour des emplacements affichés sur la carte 
    async function refreshLocations(map, roadClient) {
      // Incrémentation du numéro de génération modulo le nombre maximal de générations
      generation = (generation + 1) % maxGenerations;
    
      // Récupération des coordonnées des coins nord-est et sud-ouest de la zone affichée sur la carte
      const zoomLevel = map.getZoom();
      const ne = map.getBounds().getNorthEast();
      const sw = map.getBounds().getSouthWest();
    
      let response;
      try {
        // Appel asynchrone à la méthode 'fetchLocations' de 'roadClient' pour obtenir les données des emplacements
        response = await roadClient.fetchLocations({
          zoom: zoomLevel,
          nwLat: ne.lat(),
          nwLng: sw.lng(),
          seLat: sw.lat(),
          seLng: ne.lng(),
          generation,
        });
      } catch(e) {
        // Gestion des erreurs lors de la récupération des données des emplacements
        if (e instanceof DOMException) {
          return; // Si une exception DOM est levée, on abandonne le traitement
        }
        showError(e); // Affichage de l'erreur dans l'interface utilisateur
        return;
      }
    
      // Traitement de la réponse obtenue
      response = response || {};
      const clusters = response.clusters || [];
      const locations = response.locations || [];
      const responseGeneration = response.generation || 0;
    
      // Vérification si la génération de la réponse est antérieure à la génération actuelle
      if (responseGeneration < generation) {
        return; // Si c'est le cas, on abandonne le traitement
      }
    
      // Zoom sur le cluster sélectionné s'il est disponible
      for (const cluster of clusters) {
        if (selectedCluster && `lat:${selectedCluster.lat}-lng:${selectedCluster.lng}` == `lat:${cluster.position.lat}-lng:${cluster.position.lng}`) {
          zoomOnPosition(selectedCluster); // Zoom sur la position du cluster sélectionné
          return;
        }
      }
      selectedCluster = null; // Réinitialisation du cluster sélectionné
    
      // Création des marqueurs pour les clusters
      //for (const cluster of clusters) {
      //  clusterMarkers[positionToKey(cluster.position)] = {
      //    marker: clusterMarker(map, cluster), // Création du marqueur de cluster
      //    generation, // Attribution de la génération actuelle
      //  };
      //}
      
      // Création des marqueurs pour les emplacements
      //for (const location of locations) {
      //  locationMarkers[positionToKey(location.position)] = {
      //    marker: locationMarker(map, location, roadClient), // Création du marqueur d'emplacement
      //    generation, // Attribution de la génération actuelle
      //  };
      //}
    
      // Actualisation des marqueurs sur la carte
      //refreshMarkers(clusterMarkers, generation);
      //refreshMarkers(locationMarkers, generation);
    }
    
    // crée et retourne un marqueur représentant un cluster de stations de recharge sur la carte
    function clusterMarker(map, {count, position}) {
      // Vérification si un marqueur de cluster existe déjà pour cette position
      const existingMarker = clusterMarkers[positionToKey(position)];
    
      // Si un marqueur existe déjà, met à jour le texte de son étiquette avec le nouveau compte
      if (existingMarker) {
        const currentLabel = existingMarker.marker.label;
        currentLabel.text = count; // Mise à jour du texte de l'étiquette avec le nouveau compte
        existingMarker.marker.label = currentLabel;
        return existingMarker.marker; // Retourne le marqueur existant mis à jour
      }
    
      // Création d'un nouveau marqueur de cluster
      const marker = new google.maps.Marker({
        position: position, // Position du marqueur
        icon: {
          url: `data:image/svg+xml;base64,${clusterSvg}`, // URL de l'icône du marqueur (format SVG encodé en base64)
          scaledSize: new google.maps.Size(45, 45), // Taille de l'icône du marqueur
        },
        label: {
          text: "" + count, // Texte de l'étiquette du marqueur, représentant le compte de stations de recharge
          color: "rgba(255,255,255,0.9)", // Couleur du texte de l'étiquette
          fontSize: "12px", // Taille de la police du texte de l'étiquette
        },
        map, // Carte à laquelle le marqueur est associé
        title: `Cluster of ${count} charging stations`, // Titre affiché lors du survol du marqueur
        // Ajustement de l'indice Z pour être au-dessus des autres marqueurs
        zIndex: google.maps.Marker.MAX_ZINDEX + count, // Indice Z du marqueur
        visible: false // Visibilité initiale du marqueur (false pour ne pas l'afficher immédiatement)
      });
    
      // Ajout d'un écouteur d'événements pour gérer le clic sur le marqueur de cluster
      marker.addListener('click', () => {
        selectedCluster = position; // Mise à jour du cluster sélectionné
        zoomOnPosition(position); // Zoom sur la position du cluster sélectionné
      });
    
      return marker; // Retourne le nouveau marqueur de cluster créé
    }
    
    // prend une position géographique comme paramètre et effectue un zoom sur cette position sur la carte.
    function zoomOnPosition(position) {
      map.setCenter(position);
      const zoom = map.getZoom()
      map.setZoom(zoom + 1);
    }
  
    // fermer la barre latérale (sidebar) dans l'interface utilisateur
    function closeSidebar(e) {
      selectedLocation = null;
      sidebar.style.left = "-350px";
    }
  
    // chargée de créer et de configurer les marqueurs de localisation sur la carte
    function locationMarker(map, location, roadClient) {
      let svg;
      let svgHover;
    
      // Sélectionne le SVG en fonction du statut de l'emplacement
      switch (location.status) {
        case StatusAvailable:
          svg = locationAvailableSvg;
          svgHover = locationAvailableHoverSvg;
          break;
        case StatusCharging:
          svg = locationChargingSvg;
          svgHover = locationChargingHoverSvg;
          break;
        case StatusUnavailable:
          svg = locationUnavailableSvg;
          svgHover = locationUnavailableHoverSvg;
          break;
        case StatusUnknown:
          svg = locationUnknownSvg;
          svgHover = locationUnknownHoverSvg;
          break;
        default:
          throw `Invalid status: ${location.status}`;
      }
    
      // Vérifie l'existence du marqueur pour cet emplacement
      const existingMarker = locationMarkers[positionToKey(location.position)];
      if (existingMarker) {
        // Met à jour l'URL de l'icône du marqueur avec le SVG correspondant
        existingMarker.marker.icon.url = `data:image/svg+xml;base64,${svg}`;
        return existingMarker.marker; // Renvoie le marqueur existant
      }
    
      // Crée un nouveau marqueur pour cet emplacement
      const marker = new google.maps.Marker({
        position: location.position,
        icon: {
          url: `data:image/svg+xml;base64,${svg}`,
          scaledSize: new google.maps.Size(45, 45),
        },
        label: {
          text: " ",
        },
        map,
        title: " ",
        zIndex: google.maps.Marker.MAX_ZINDEX + 10000,
        visible: false
      });
    
      // Ajoute des écouteurs d'événements pour le survol et le clic sur le marqueur
      marker.addListener('mouseover', function() {
        marker.setIcon({
          url: `data:image/svg+xml;base64,${svgHover}`,
          scaledSize: new google.maps.Size(45, 45),
        });
      });
    
      marker.addListener('mouseout', function() {
        marker.setIcon({
          url: `data:image/svg+xml;base64,${svg}`,
          scaledSize: new google.maps.Size(45, 45),
        });
      });
    
      marker.addListener('click', async function() {
        renderSidebarPerso(location); // Affiche les détails de l'emplacement dans la barre latérale
        //const url = `https://maps.google.com/maps?daddr=${location.position.lat},${location.position.lng}`
        //window.open(url, '_blank').focus();
      });
    
      return marker; // Renvoie le nouveau marqueur créé
    }
    
    // traduit un composant de prix en une chaîne de caractères descriptive, en fonction de son type
    function translatePriceComponent(priceComponent, currency) {
      switch (priceComponent.type) {
        case 'FLAT':
          return `Start Fee ${formatCurrency(priceComponent.price * 1.21, {
            currency,
          })} incl. VAT`;
        case 'TIME':
          return `Hourly rate ${formatCurrency(priceComponent.price * 1.21, {
              currency,
            })} incl. VAT per hour`;
          case 'ENERGY':
            return `Energy cost ${formatCurrency(priceComponent.price * 1.21, {
              currency,
            })} incl. VAT per KWh`;
          default:
            return '';
      }
    }
  
    // prettier-ignore
    // génère le contenu HTML spécifique pour afficher les détails du tarif d'un connecteur de recharge, tels que le prix et le type de tarification
    function renderConnectorTariff(tariff, unreliableTariffs, customNote) {
      if (!tariff) return [];
  
      const content = [];
  
      const elements = tariff.elements || [];
      const currency = tariff.currency || '';
  
      const hasPriceComponents = elements.some((element) => element.price_components && element.price_components.length > 0);
  
      const unreliableTariffsNote = "This operator may not be sending accurate tariffs. Please check tariff information at the physical location or the operator's support desk"
      const inaccurateTariffsNote = 'Tariffs shown here have been sent to E-Flux by roaming partner. Accuracy may vary depending on provider'
  
      content.push('<div style="font-size: 12px">');
        if (hasPriceComponents) {
          content.push(`<div style="margin-bottom: 1em; font-style: italic;">${unreliableTariffs ? customNote || unreliableTariffsNote : inaccurateTariffsNote}</div>`)
        } else {
          content.push('<div>No tariff available</div>');
        }
        for (const element of elements) {
          const price_components = element.price_components || [];
          for (const component of price_components) {
            content.push(`<div>${sanitize(translatePriceComponent(component, currency))}</div>`);
          }
        }
      content.push('</div>');
  
      return content;
    }
  
    // prettier-ignore
    // génère le contenu HTML pour afficher tous les détails d'un connecteur de recharge spécifique, y compris les détails du connecteur lui-même ainsi que les détails du tarif
    function renderConnector(location, evse, connector) {
      const content = [];
      const image = ICONS[`ICON_${connector.standard}`];
      content.push('<tr style="background: rgba(0, 0, 0, 0.3)">');
        content.push('<td style="width: 16px">');
          if (image) {
            content.push(`<span>${image}</span>`);
          }
          content.push(sanitize(formatConnectorType(connector.standard)));
        content.push('</td>');
      content.push('</tr>');
  
      content.push('<tr>');
        content.push('<td>');
          if(!connector.voltage && connector.power_type) {
            content.push(`<div class="label grey" style="margin-bottom: 5px">${sanitize(connector.power_type)}</div>`);
          }
          if (connector.maxPower || evse.maxPower || location.maxPower) {
            content.push(
              `<p>
                Max Power: 
                ${Math.round(
                  (connector.maxPower ||
                    evse.maxPower ||
                    location.maxPower) * 100
                ) / 100} kW
              </p>`
            );
          }
          content.push(...renderConnectorTariff(connector.tariff, location.unreliableTariffs, location.customNote));
        content.push('</td>');
      content.push('</tr>');
      return content;
    }
  
    // prettier-ignore
    // génère le contenu HTML pour afficher les détails d'un équipement de recharge électrique (EVSE) spécifique
    function renderEvse(location, evse) {
      const content = [];
      // Début de la section EVSE
      content.push('<div>');
        // Titre avec l'icône EVSE et l'ID de l'EVSE
        content.push('<h4 class="inverted">');
          content.push(`<span>${ICON_EVSE}</span>`);
          content.push(sanitize(evse.evse_id));
        content.push('</h4>');
        // Tableau pour afficher les détails de l'EVSE
        content.push('<table class="inverted">');
          content.push('<tbody>');
            // Ligne pour afficher le statut de l'EVSE
            content.push('<tr>');
              content.push('<td>Status</td>');
              content.push('<td>');
                // Div pour le statut avec la couleur correspondante
                content.push(`<div class="label ${colorForMinorStatus(location.status, evse.status)}">`);
                  content.push(sanitize(startCase((evse.status || '').toLowerCase())));
                content.push('</div>');
              content.push('</td>');
            content.push('</tr>');
            // Ligne pour afficher la puissance maximale de l'EVSE si disponible
            if (evse.maxPower) {
              content.push('<tr>');
                content.push('<td>Max Power</td>');
                content.push(`<td>${Math.round(evse.maxPower * 100) / 100}kW</td>`);
              content.push('</tr>');
            }
          content.push('</tbody>');
        content.push('</table>');
    
        // Tableau pour afficher les détails des connecteurs de l'EVSE
        content.push('<table class="inverted" style="margin-top: -16px">');
          content.push('<tbody>');
          const connectors = evse.connectors || [];
          // Pour chaque connecteur, appeler renderConnector et ajouter son contenu
          for (const connector of connectors) {
            content.push(...renderConnector(location, evse, connector));
          }
        content.push('</tbody>');
      content.push('</table>');
      // Diviseur entre chaque EVSE
      content.push('<div class="divider"></div>');
      // Fin de la section EVSE
      content.push('</div>');
      return content;
    }
    
    // prettier-ignore
    // génère le contenu HTML pour afficher les détails d'un emplacement dans une barre latérale
    function renderSidebarPerso(location) {
      const facilities = formatLocationFacilities(location);
  
      let content = [];
      content.push('<div style="padding-left: 1em; padding-right: 1em" class="sidebar-container">');
        content.push('<h3>');
          content.push(sanitize(location.name));
        content.push('</h3>');
        content.push('<table class="inverted">');
          content.push('<tbody>');
            content.push('<tr>');
              content.push('<td>Status</td>');
              content.push('<td>')
              content.push(`<div class="label ${colorForStatus(location.status)}">${sanitize(labelForStatus(location.status))}</div>`);
              content.push('</td>');
            content.push('</tr>');
            if (location.floor_level) {
              content.push('<tr>');
                content.push('<td>Floor Level</td>');
                content.push(`<td>${sanitize(location.floor_level)}</td>`);
              content.push('</td>');
            }
            if (location.physical_reference) {
              content.push('<tr>');
                content.push('<td>Physical Reference</td>');
                content.push(`<td>${sanitize(location.physical_reference)}</td>`);
              content.push('</td>');
            }
  
            if (location.directions && location.directions.text) {
              content.push('<tr>');
                content.push('<td>Directions</td>');
                content.push(`<td>${sanitize(location.directions.text)}</td>`);
              content.push('</td>');
            }
  
            if(location.suboperator && location.suboperator.name) {
              content.push('<tr>');
                content.push('<td>Suboperator</td>');
                content.push(`<td>${sanitize(location.suboperator.name)}</td>`);
              content.push('</td>');
            }
  
            content.push('<tr>');
              content.push('<td>Address</td>');
              content.push(`<td>${sanitize(location.address)}, ${sanitize(location.city)}</td>`);
            content.push('</td>');
  
            if (location.telephoneNumber) {
              content.push('<tr>');
                content.push('<td>Telephone</td>');
                content.push(`<td>${sanitize(location.telephoneNumber)}</td>`);
              content.push('</td>');
            }
  
            if (facilities && facilities.length) {
              content.push('<tr>');
                content.push('<td>Facilities</td>');
                content.push(`<td>${sanitize(facilities.join(', '))}</td>`);
              content.push('</td>');
            }
          content.push('</tbody>');
        content.push('</table>');
        content.push('<div class="divider"></div>');
        if (location.evses && location.evses.length > 0) {
          for (const evse of location.evses) {
            content.push(...renderEvse(location, evse));
          }
        }
        content.push('<div class="divider"></div>');
        content.push(`<p>Last updated <b>${location.updatedAt && new Date(location.updatedAt).toDateString()}</b> from <b>${sanitize(location.source)}</b></p>`)
        content.push('<div class="divider"></div>');
  
      content.push(`<a class="directions" href="https://maps.google.com/maps?daddr=${location.geoLocation.coordinates[1]},${location.geoLocation.coordinates[0]}" target="_blank" style="margin: 0"><span>${carSvg} Directions</span></a>`);
      content.push('</div>');
      content.push('<div class="divider"></div>');
      return content.join(' ');
    }
  
    return {
      initRoadMap,
      getMap: () => map,
      center: function() {
        if (!map) {
          return {
            lat: 0,
            lng: 0
          };
        }
        const center = map.getCenter();
        return {
          lat: center.lat(),
          lng: center.lng(),
        };
      },
      unmount: function() {
        //refreshMarkers(clusterMarkers, maxGenerations + 1);
        //refreshMarkers(locationMarkers, maxGenerations + 1);
        if (map) {
          google.maps.event.clearListeners(map, 'dragend');
          google.maps.event.clearListeners(map, 'zoom_changed');
          google.maps.event.clearListeners(map, 'click');
        }
        if (autocomplete) google.maps.event.clearListeners(autocomplete, 'place_changed');
        if (search) search.removeEventListener('focus', clearSearch);
        if (errorMessage) errorMessage.removeEventListener('click', hideErrorMessage);
        if (sidebar) sidebar.removeEventListener('click', closeSidebar);
        if (widget) widget.innerHTML = '';
      }
    };
  }());
  
  // #############################################################################################################################
  // #############################################################################################################################
  // #############################################################################################################################
  // #############################################################################################################################
  
  //  const removeMarkers = () => {
  //    Markers.forEach((m) => m.setMap(null));
  //    Markers = [];
  //}
  
  var selectedChargeType = 'all';
  
  all.addEventListener('click', function(){
  selectedChargeType = 'all';
  })
  
  normal.addEventListener('click', function(){
  selectedChargeType = 'normal';
  })
  
  fast.addEventListener('click', function(){
  selectedChargeType = 'fast';
  })
  
  const baseUrl = "https://map.road.io";
  
  function kmToDegrees(km, latitude) {
  const earthRadiusKm = 6371; // Rayon moyen de la Terre en km
  
  // Conversion pour la latitude (indépendant de la position)
  const deltaLat = km / earthRadiusKm * (180 / Math.PI);
  console.log("Delta Latitude: " + deltaLat); // Ajout d'un message de débogage
  
  // Conversion pour la longitude (dépend de la latitude actuelle)
  const deltaLng = (km / earthRadiusKm) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180);
  console.log("Delta Longitude: " + deltaLng); // Ajout d'un message de débogage
  
  return { deltaLat, deltaLng };
  }
  
  // fournit des fonctionnalités pour effectuer des requêtes vers une API Road.io
  class RoadClient {
  apiURL = baseUrl;
  // a partir de ce base url il faut que j'essaie de comprendre le fonctionnement de sidebar et le reproduire
    
  constructor(token) {
    this.token = token;
    this.abort = new AbortController();
    this.timeout = null;
  }
    
  _token;
    
  get token() {
    return this._token;
  }
    
  set token(token) {
    if (!token) {
      throw new Error("No valid Road.io token provided");
    }
    
    this._token = token;
  }
    
  async request(options) {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null
    }
    this.abort.abort();
    this.abort = new AbortController();
    const signal = this.abort.signal;
    try {
      const reqURL = `${this.apiURL}${options.path}`;
      const token = this.token;
      const perform = new Promise(function(resolve, reject) {
        this.timeout = setTimeout(function() {
          fetch(reqURL, {
            signal,
            method: options.method || "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(resolve).catch(reject);
        }, 500);
      }.bind(this))
      const response = await perform;
      switch (response.status) {
      case 200:
        return response.json();
      case 400:
        throw new Error('Bad request');
      case 404:
        throw new Error('Not Found');
      case 500:
        throw new Error('Server Error');
      case 503:
        throw new Error('Timeout!');
      default:
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (e) {
      if (e instanceof DOMException) {
        return null;
      }
      throw e;
    }
  }
    
  // récupère les bornes de recharges
  // url complet : https://map.road.io/api/v1/locations?zoom=14&nwLat=48.090944022644656&nwLng=-0.8150174373535246&seLat=48.050280544581774&seLng=-0.7309033626464934&generation=2
  async fetchLocations(params) {
    return await this.request({
      path: `/api/v1/locations?${new URLSearchParams(params).toString()}`,
    });
  }
    
  // url complet : https://map.road.io/api/v1/locations/details?lat=48.076943&lng=-0.752428
  async fetchLocationDetails({lat, lng}) {
    return await this.request({
      path: `/api/v1/locations/details?${new URLSearchParams({lat, lng}).toString()}`
    });
  }
  }
  
  function getTotalDistance(result) {
    let totalDistance = 0;
    result.routes[0].legs.forEach(leg => {
        totalDistance += leg.distance.value; // Utilisez .value pour obtenir la distance en mètres
    });
    return Math.round(totalDistance / 1000); // Arrondir au kilomètre le plus proche
  }
  
  async function fetchNearestChargePoints(latitude, longitude, selectedChargeType) {
    const userToken = "741131bb-88ac-5471-898c-1a978d0c8563";
    const roadClient = new RoadClient(userToken);
  
    // Définir le rayon en km
    const radiusInKm = 20;
    const { deltaLat, deltaLng } = kmToDegrees(radiusInKm, latitude);
  
    // Ajuster les paramètres pour un périmètre de 20 km
    const params = {
        zoom: 14,
        nwLat: latitude + deltaLat,
        nwLng: longitude - deltaLng,
        seLat: latitude - deltaLat,
        seLng: longitude + deltaLng,
        generation: 2
    };
  
    try {
        const data = await roadClient.fetchLocations(params);
  
        if (data && data.locations && data.locations.length > 0) {
            // Trier les points de recharge par distance par rapport à l'emplacement actuel
            data.locations.sort((a, b) => {
                const distanceA = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(latitude, longitude),
                    new google.maps.LatLng(a.position.lat, a.position.lng)
                );
                const distanceB = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(latitude, longitude),
                    new google.maps.LatLng(b.position.lat, b.position.lng)
                );
  
                return distanceA - distanceB;
            });
  
            const bornesArray = data.locations;
  
            // Vérifier les critères pour chaque point de recharge trié
            for (let chargePoint of bornesArray) {
                const details = await roadClient.fetchLocationDetails({
                    lat: chargePoint.position.lat,
                    lng: chargePoint.position.lng
                });
  
                let etat = false;
                if (selectedChargeType === 'normal') {
                    if (details.maxPower >= 3 && details.maxPower <= 30 && details.status === 'AVAILABLE') {
                        etat = true;
                    }
                } else if (selectedChargeType === 'fast') {
                    if (details.maxPower > 30 && details.status === 'AVAILABLE') {
                        etat = true;
                    }
                } else {
                    if (details.status === 'AVAILABLE') {
                        etat = true;
                    }
                }
  
                if (etat === true) {
                    // Initialiser la carte si ce n'est pas déjà fait
                    const widget = document.getElementById('road-embed-map');
                    const mapContainer = document.createElement('div');
                    widget.appendChild(mapContainer);
                    mapContainer.setAttribute("class", "road-embed-map-container");
                    mapContainer.style.position = 'relative';
                    mapContainer.style.overflow = 'hidden';
                    mapContainer.style.height = '400px'; // Définir une hauteur pour la carte
  
                    const lat = details.geoLocation.coordinates[1];
                    const lng = details.geoLocation.coordinates[0];
                    const svg = window.btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
                            <circle cx="120" cy="120" opacity="1" r="50" fill="#006600" stroke="white" stroke-width="12" />
                        </svg>
                    `);
  
                    map = new google.maps.Map(mapContainer, {
                        zoom: 14,
                        center: new google.maps.LatLng(lat, lng),
                        mapTypeControl: false,
                        fullscreenControl: false
                    });
  
                    // Ajouter des marqueurs verts sur la carte pour chaque borne utilisée
                    new google.maps.Marker({
                        position: { lat: lat, lng: lng },
                        map: RoadIO.getMap(map),
                        icon: {
                            url: `data:image/svg+xml;base64,${svg}`,
                            scaledSize: new google.maps.Size(45, 45)
                        },
                        title: details.name
                    });
  
                    // Retourner le premier point de recharge qui correspond aux critères
                    return details;
                }
            }
        }
  
        // Si aucune borne correspondant aux critères n'est trouvée
        return null;
    } catch (error) {
        console.error('Error fetching nearest charging points:', error);
        return null;
    }
  }
  
  // calcul le pourcentage restant
  function calculForCalcRoute(distance) {
    var charge = document.getElementById('charge').value;
    var conso = document.getElementById('conso').value;
    var battery = document.getElementById('battery').value;
    
            // pour convertir le pourcentage en kWh
            var chargeKWh = (battery * charge) / 100;
  
            // connaitre le niveau correspondant à 30%
            var trentePourcent = battery * 30 / 100;
  
            // connaitre la plage de kWh avant les 30 %
            var plagePourcent = chargeKWh - trentePourcent;
  
            // convertir les kWh restant en km
            var prevCharge = (100 * plagePourcent) / conso;
  
            // avoir la consommation réelle du trajet
            var consoReel = (conso * distance) / 100;
  
            // avoir le reste de charge en kWh
            var chargeResteKWh = chargeKWh - consoReel;
  
            // savoir le pourcentage restant
            var restPercent = (chargeResteKWh * 100) / battery;
  
            return { prevCharge: prevCharge, restPercent: restPercent };
  }
  
  function verifWaypointsCalcNewRoute(verifWaypoints, selectedChargeType, result, prevCharge, destinationCoordinates, map) {
    var lastWaypoint = verifWaypoints.length - 1;
    var lastWaypointAddress = verifWaypoints[lastWaypoint].location;
    // Use the Google Maps Geocoding service to convert address to coordinates
    var geocoder = new google.maps.Geocoder();
    var prevChargeMeters = prevCharge * 1000;
  
    geocoder.geocode({ 'address': lastWaypointAddress.query }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var latitude = results[0].geometry.location.lat();
            var longitude = results[0].geometry.location.lng();
            var lastWaypointLatLng = new google.maps.LatLng(latitude, longitude);
  
            // Calculer la direction entre le dernier waypoint et la destination
            var directionToDestination = google.maps.geometry.spherical.computeHeading(lastWaypointLatLng, destinationCoordinates);
  
            // Calculer les coordonnées du point insuffisamment chargé à une distance donnée du dernier waypoint dans la direction de la destination
            var insufficientChargePoint = google.maps.geometry.spherical.computeOffset(
                lastWaypointLatLng,
                prevChargeMeters,
                directionToDestination
            );
  
            // Récupérer la borne de recharge la plus proche du nouveau point
            fetchNearestChargePoints(insufficientChargePoint.lat(), insufficientChargePoint.lng(), selectedChargeType)
                .then(nearestChargePoint => {
                    if (nearestChargePoint) {
                        // Si une borne de recharge est trouvée à proximité, appeler la fonction reCalcIti avec cette borne
                        reCalcIti(nearestChargePoint, prevCharge, result, destinationCoordinates);
                    } else {
                        output.innerHTML = "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i>Aucune borne de recharge correspondante trouvée (essayer de sélectionner autre que recharge rapide).</div>";
                        
                        
                        ('Aucune borne de recharge trouvée à proximité.');
                        // Gérer le cas où aucune borne de recharge n'est trouvée à proximité
                    }
                })
                .catch(error => console.error('Erreur lors de la récupération de la borne de recharge la plus proche:', error));
            } else {
                console.error('Geocode was not successful for the following reason: ' + status);
            }
        });
  }
    
    var infosBornes = [];
  
  function calcRoute() {
      infosBornes = [];
      var charge = document.getElementById('charge').value;
      var avoidHighwaysStatut = document.getElementById('avoidHighways').checked;
  
      // Create request
      var request = {
          origin: document.getElementById("from").value,
          destination: document.getElementById("to").value,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: avoidHighwaysStatut
      };
  
      var directionsDisplay = new google.maps.DirectionsRenderer();
      directionsDisplay.setMap(RoadIO.getMap());
      var directionsService = new google.maps.DirectionsService();
      // Pass the request to the route method
      directionsService.route(request, function (result, status) {
          if (status == google.maps.DirectionsStatus.OK) {
              // Display route information
              var distanceData = result.routes[0].legs[0].distance.text;
              var distanceDataSansKm = distanceData.replace(' km', '');
              var distanceSansVirgule = distanceDataSansKm.replace(',', '.');
              var distance = distanceSansVirgule.replace(/\s+/g, '');
  
              var { prevCharge, restPercent } = calculForCalcRoute(distance);
  
              if (prevCharge <= distance) {
                  var route = result.routes[0].overview_path;
                  var prevChargeMeters = prevCharge * 1000;
  
                  // Calculer le point d'insuffisance de batterie le long de l'itinéraire
                  var distanceTraveled = 0;
                  var insufficientChargePoint = null;
                  for (var i = 0; i < route.length - 1; i++) {
                      var segmentDistance = google.maps.geometry.spherical.computeDistanceBetween(route[i], route[i + 1]);
                      if (distanceTraveled + segmentDistance >= prevChargeMeters) {
                          var remainingDistance = prevChargeMeters - distanceTraveled;
                          insufficientChargePoint = google.maps.geometry.spherical.computeOffset(route[i], remainingDistance, google.maps.geometry.spherical.computeHeading(route[i], route[i + 1]));
                          break;
                      }
                      distanceTraveled += segmentDistance;
                  }
  
                  // Ajouter un marker au point où la batterie est insuffisante
                  if (insufficientChargePoint) {
                      new google.maps.Marker({
                          position: insufficientChargePoint,
                          map: RoadIO.getMap(),
                          title: "Battery Insufficient Here"
                      });
                  }
  
                  calcNewRoute(result, prevCharge, result.routes[0].legs[0].end_location);
              } else {
                  console.log('ok c\'est bon');
              }
  
              var totalDurationText = getTotalDuration(result);
  
              const output = document.querySelector('#output');
              output.innerHTML = "<div class='alert-info'>De: " + document.getElementById("from").value + " avec " + charge + " %.<br />à: " + document.getElementById("to").value + " avec " + Math.round(restPercent) + " %.<br /> Distance <i class='fas fa-road'></i> : " + result.routes[0].legs[0].distance.text + ".<br />Durée <i class='fas fa-hourglass-start'></i> : " + totalDurationText;
  
              // Supprimer les anciens markers
              // removeMarkers();
  
              // Afficher l'itinéraire sur la carte
              directionsDisplay.setDirections(result);
          } else {
              // Supprimer l'itinéraire de la carte
              directionsDisplay.setDirections({ routes: [] });
  
              // Centrer la carte
              map.setCenter(myLatLng);
  
              // Afficher un message d'erreur
              output.innerHTML = "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Impossible de trouver la distance.</div>";
          }
      });
  }
  
  function calcNewRoute(result, prevCharge, destinationCoordinates) {
    const output = document.querySelector('#output');
  
    var verifWaypoints = result.request.waypoints;
    
    if (verifWaypoints != undefined && verifWaypoints.length > 0) {
        // Appelez la fonction verifWaypointsCalcNewRoute en passant les mêmes paramètres
        verifWaypointsCalcNewRoute(verifWaypoints, selectedChargeType, result, prevCharge, destinationCoordinates, RoadIO.map);
    } else {   
        // If there are no waypoints, calculate from the origin to 30%
        var overviewPath = result.routes[0].overview_path; // Get the overview path of the route
        var totalDistance = 0;
        var insufficientChargePoint = null;
    
        for (var i = 1; i < overviewPath.length; i++) {
            var distanceToNextPoint = google.maps.geometry.spherical.computeDistanceBetween(overviewPath[i - 1], overviewPath[i]);
            totalDistance += distanceToNextPoint;
    
            if (totalDistance >= prevCharge * 1000) {
                // Use the current point as insufficientChargePoint
                insufficientChargePoint = overviewPath[i];
                break;
            }
        }
    
        //if (insufficientChargePoint) { // Vérifier si insufficientChargePoint est défini
        //    var marker = new google.maps.Marker({
        //        position: insufficientChargePoint,
        //        map: map, // Ajouter le marqueur à la carte
        //        title: 'Point insuffisamment chargé' // Titre du marqueur (facultatif)
        //    });
        //}
        if(!insufficientChargePoint){
            output.innerHTML = "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i>Aucune borne de recharge correspondante trouvée (essayer de modifier légèrement votre pourcentage de batterie).</div>";
        }
  
        fetchNearestChargePoints(insufficientChargePoint.lat(), insufficientChargePoint.lng(), selectedChargeType)
        .then(insufficientChargePoint => {
            if (insufficientChargePoint) {
                
                reCalcIti(insufficientChargePoint, prevCharge, result, destinationCoordinates);
            } else {
                        output.innerHTML = "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i>Aucune borne de recharge correspondante trouvée (essayer de modifier légèrement votre pourcentage de batterie).</div>";
                        console.log('Aucune borne de recharge trouvée à proximité.');
            }
        })
        .catch(error => console.error('Erreur lors de la récupération de la borne de recharge la plus proche:', error));
    }
  }
  
  
  function getTotalDuration(result) {
    let totalDuration = 0;
    result.routes[0].legs.forEach(leg => {
        totalDuration += leg.duration.value; // Utilisez .value pour obtenir la durée en secondes
    });
  
    // Convertir la durée totale en format lisible (heures et minutes)
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.round((totalDuration % 3600) / 60);
  
    return hours + " heures et " + minutes + " minutes";
  }
  
  function addressNotNull(address, additionalInfo) {
    if (!address && !additionalInfo) {
        return "Non renseigné.";
    } else {
        var fullAddress = '';
        if (address) {
            fullAddress += address;
        }
        if (additionalInfo) {
            fullAddress += (address ? ", " : "") + additionalInfo;
        }
        return fullAddress;
    }
  }
  
  
  function reCalcIti(insufficientChargePoint, prevCharge, result, destinationCoordinates) {
  var avoidHighwaysStatut = document.getElementById('avoidHighways').checked;
  
  // Create request
  var request = {
      origin: document.getElementById("from").value,
      destination: document.getElementById("to").value,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: avoidHighwaysStatut
  };
  
  var capaChargeCar = document.getElementById('capaChargeCar').value;
  var powerKW = insufficientChargePoint.maxPower;
  
  if (powerKW < capaChargeCar) {
      capaChargeCar = powerKW;
  }
  
  var conso = document.getElementById('conso').value;
  var battery = document.getElementById('battery').value;
  var charge = document.getElementById('charge').value;
  
  var waypoints = [];
  
  // Add previous waypoints to the request
  var prevWaypoints = result.request.waypoints;
  if (prevWaypoints) {
      for (var i = 0; i < prevWaypoints.length; i++) {
          waypoints.push({
              location: prevWaypoints[i].location,
              stopover: true 
          });
      }
  }
  
  // Exemple de requête à l'API Geocoding
  var lat = insufficientChargePoint.geoLocation.coordinates[1];
  var lng = insufficientChargePoint.geoLocation.coordinates[0];
  var apiKey = 'AIzaSyCHKZ2EUvq0Auxg6utOCuO_40eesyG2MNc';
  
  // Construction de l'URL de requête
  var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  
  // Envoi de la requête GET à l'API Geocoding
  fetch(url)
      .then(response => response.json())
      .then(data => {
          // Traitement de la réponse de l'API
          if (data.status === 'OK' && data.results.length > 0) {
              var addressData = data.results[0].formatted_address; // Assigner la valeur à la variable
  
              //console.log(addressData, 'data');
              
              // Vérifier si l'adresse n'est pas déjà présente dans les waypoints
              var isAddressAlreadyAdded = waypoints.some(waypoint => waypoint.location.query === addressData);
  
              // Ajouter le nouveau waypoint s'il n'est pas déjà présent
              if (!isAddressAlreadyAdded) {
                  waypoints.push({
                      location: addressData,
                      stopover: true
                  });
              }
  
              // Continue processing after the address is resolved
              processItinerary(request, waypoints, insufficientChargePoint, prevCharge, result, destinationCoordinates, battery, conso, charge, capaChargeCar);
          } else {
              console.error('Erreur lors de la récupération de l\'adresse.');
          }
      })
      .catch(error => console.error('Erreur lors de la requête à l\'API Geocoding:', error));
  }
  
  function processItinerary(request, waypoints, insufficientChargePoint, prevCharge, result, destinationCoordinates, battery, conso, charge, capaChargeCar) {
  request.waypoints = waypoints;
  
  var directionsService = new google.maps.DirectionsService();
  console.log(waypoints, 'waypoints')
  // Re-calculer l'itinéraire avec les nouveaux waypoints
  directionsService.route(request, function(result, updatedStatus) {
      if (updatedStatus == google.maps.DirectionsStatus.OK) {
          // Afficher le nouvel itinéraire sur la carte
          var directionsDisplay = new google.maps.DirectionsRenderer();
          directionsDisplay.setDirections(result);
          //console.log(result, 'result')
  
          // Récupérer la distance entre le dernier waypoint et la destination
          var lastLegIndex = result.routes[0].legs.length - 1;
          var lastLegDistanceData = result.routes[0].legs[lastLegIndex].distance.text;
          var lastLegDistanceDataSansKm = lastLegDistanceData.replace(' km', '');
          var lastLegDistanceDataSansKmSansEspace = lastLegDistanceDataSansKm.replace(/\s+/g, '');
          var remainingDistance = parseFloat(lastLegDistanceDataSansKmSansEspace.replace(',', '.')); // Convertir en nombre
  
          // Pour convertir le pourcentage en kWh
          var chargeKWh = (battery * charge) / 100;
  
          // Savoir la consommation jusqu'à l'arrêt borne
          var consoDepartBorne = (conso * remainingDistance) / 100;
          
          // Savoir le nombre de kWh restant en arrivant à la borne
          var resteKwBorne = chargeKWh - consoDepartBorne;
          
          // Connaitre les kWh correspondant à 85% de batterie
          var quatreVingtCinq = (battery * 85) / 100;
          
          // Connaitre la plage de recharge
          var plageRecharge = quatreVingtCinq - resteKwBorne;
          
          // Récupérer le temps de recharge
          var tempsRecharge = (plageRecharge / capaChargeCar) * 60;
          
          // Avoir la conso réelle de la borne à la destination
          var consoReelApresBorne = conso * remainingDistance / 100;
  
          // Avoir le reste de charge en kWh
          var chargeResteKWhApresBorne = quatreVingtCinq - consoReelApresBorne;
          
          // Savoir le pourcentage restant
          var restPercentApresBorne = Math.round((chargeResteKWhApresBorne * 100) / battery);
          if (restPercentApresBorne < 30) {
              // Connaitre le niveau correspondant à 30%
              var trentePourcent = battery * 30 / 100;
              
              // Connaitre la plage de kWh avant les 30 %
              var plagePourcent = quatreVingtCinq - trentePourcent;
  
              // Convertir les kWh restants en km
              var prevCharge = (100 * plagePourcent) / conso;
              
              calcNewRoute(result, prevCharge, destinationCoordinates);
          } else {
              console.log('ok');
          }
          
          var tempsRechargeArrondi = Math.round(tempsRecharge);
  
          // Créer un objet avec les informations de la borne
          var powerKw = insufficientChargePoint.maxPower ? insufficientChargePoint.maxPower : "Non renseigné";
  
          var borneInfo = {
              temps: tempsRechargeArrondi,
              titre: insufficientChargePoint.name,
              adresse: addressNotNull(insufficientChargePoint.address, insufficientChargePoint.city),
              puissance: powerKw
          };
  console.log(borneInfo, 'borneInfo')
          // Vérifier si la nouvelle borne n'existe pas déjà dans le tableau
          var isDuplicate = infosBornes.some(borne => borne.adresse === borneInfo.adresse);
  
          // Ajouter l'objet au tableau infosBornes uniquement s'il n'existe pas déjà
          if (!isDuplicate) {
              infosBornes.push(borneInfo);
          }
  
          document.getElementById('openMapBtn').addEventListener('click', function() {
              // Créer le lien vers Google Maps avec l'itinéraire et les options
              var googleMapsLink = "https://www.google.com/maps/dir/";
  
              // Ajouter l'origine
              googleMapsLink += encodeURIComponent(document.getElementById("from").value);
  
              // Ajouter les étapes intermédiaires
              infosBornes.forEach(function(borne) {
                  borne.adresse = borne.adresse.replace(', Non renseigné', '');
                  googleMapsLink += "/" + encodeURIComponent(borne.adresse);
              });
  
              // Ajouter la destination
              googleMapsLink += "/" + encodeURIComponent(document.getElementById("to").value);
  
              // Vérifier si l'utilisateur veut éviter les autoroutes
              if (avoidHighwaysStatut.checked) {
                  googleMapsLink += "/data=!4m3!4m2!2m1!2b1"; // Ajouter l'option pour éviter les autoroutes
              }
  
              // Ouvrir le lien dans une nouvelle fenêtre
              window.open(googleMapsLink);
          });
  
          var totalDistance = getTotalDistance(result);
          // Construire le contenu HTML pour afficher les informations des bornes
          var bornesHTML = "<div class='affich-borne'>";
          infosBornes.forEach(function(borne, index) {
              bornesHTML += "<div class='affich-div-left'>";
              bornesHTML += "<h3>Borne " + (index + 1) + "</h3>";
              bornesHTML += "<img class='affich-img' src='../../../image/charging.png' alt='borne de recharge' />";
              bornesHTML += "</div>";
              bornesHTML += "<div class='affich-div-right'>";
              bornesHTML += "<p><strong>Temps de recharge:</strong> " + borne.temps + " min.</p>";
              bornesHTML += "<p><strong>Titre:</strong> " + borne.titre + "</p>";
              bornesHTML += "<p><strong>Adresse:</strong> " + borne.adresse + "</p>";
              bornesHTML += "<p><strong>Puissance:</strong> " + borne.puissance + " kW</p>";
              bornesHTML += "</div>";
          });
          bornesHTML += "</div>";
  
          var totalDurationText = getTotalDuration(result);
  
          // Afficher le contenu HTML dans la div output
          output.innerHTML = "<div class='alert-info'>De: " + document.getElementById("from").value + " avec " + charge + " %.<br />à: " + document.getElementById("to").value + " avec " + restPercentApresBorne + " %.<br /> Distance <i class='fas fa-road'></i> : " + totalDistance + "Km.<br />Durée <i class='fas fa-hourglass-start'></i> : " + totalDurationText + ".<br /></div>" + bornesHTML;
      } else {
          console.error('Erreur lors du recalcul de l\'itinéraire:', updatedStatus);
      }
  });
  }
  
  function processChargePoints(data, selectedChargeType) {
    data.forEach(chargePoint => {
        // Vérifier si les données de la borne de recharge sont valides
        if (chargePoint.Connections && chargePoint.Connections.length > 0 && chargePoint.Connections[0].PowerKW !== undefined) {
            // Accéder aux coordonnées de latitude et de longitude
            var latitude = chargePoint.AddressInfo.Latitude;
            var longitude = chargePoint.AddressInfo.Longitude;
  
            // Vérifier si le point de charge correspond au type sélectionné
            if ((selectedChargeType === 'normal' && chargePoint.Connections[0].PowerKW >= 3 && chargePoint.Connections[0].PowerKW <= 43) ||
                (selectedChargeType === 'fast' && chargePoint.Connections[0].PowerKW > 43) ||
                selectedChargeType === 'all') {
  
                // Déterminer la couleur du marqueur en fonction de la puissance
                var powerKW = chargePoint.Connections[0].PowerKW;
                var markerColor = '';
                if (powerKW >= 3.5 && powerKW < 7) {
                    markerColor = 'red'; // Puissance entre 3.5 et 7 kW
                } else if (powerKW >= 7 && powerKW <= 43) {
                    markerColor = 'orange'; // Puissance entre 7 et 43 kW
                } else {
                    markerColor = 'green'; // Puissance supérieure à 43 kW
                }
  
                // Créer un marqueur pour chaque point de charge avec la couleur déterminée
                //var marker = new google.maps.Marker({
                //    position: { lat: latitude, lng: longitude },
                //    map: map,
                //    title: chargePoint.AddressInfo.Title,
                //    icon: {
                //        url: 'http://maps.google.com/mapfiles/ms/icons/' + markerColor + '-dot.png' // Utiliser une icône de couleur déterminée
                //    }
                //});
  
                //Markers.push(marker);
  
                // Ajouter une info-bulle avec le titre du point de charge
                //var infoWindow = new google.maps.InfoWindow({
                //    content: chargePoint.AddressInfo.Title
                //});
  
                // Afficher l'info-bulle lorsque le marqueur est cliqué
                marker.addListener('click', function() {
                    infoWindow.open(map, marker);
                });
            }
        }
    });
  }
  
  
  function toggleDesactive(button){
    window.location.reload()
  }
  
  var gmarkers = [];
  
  // Activer le bouton cliqué (trajet/carte)
  function toggleActive(button) {
  // Désactiver 
  
    for(i=0; i<gmarkers.length; i++){
        gmarkers[i].setMap(null);
    }
    var buttons = document.querySelectorAll('.value');
    var form = document.getElementById('form-form');
    var calcBtn = document.getElementById('calc-btn');
    var googleMap = document.getElementById('googleMap');
    var filtre = document.getElementById('filtre-carte');
    var filtre2 = document.getElementById('filtre-carte2');
    form.classList.add('details-hidden')
    calcBtn.classList.add('details-hidden')
    //googleMap.classList.add('selected-carte')
    filtre.classList.remove('hidden-filtre')
    filtre2.classList.remove('hidden-filtre')
  
    buttons.forEach(function(btn) {
        btn.classList.remove('active');
    });
  
    // Activer 
    button.classList.add('active');
  
    var apiKey = '56fa6422-eeff-4be6-a733-92a29cb26fdd';
    var url = 'https://api.openchargemap.io/v3/poi/?output=json&countrycode=FR&maxresults=100000&key=' + apiKey;
    
    return fetch(url)
        .then(response => {
            return response.json();
        })
        .then(data => {
            // Assurez-vous que les données sont disponibles et qu'elles contiennent des points de charge
            if (data && data.length > 0) {
                // Parcourir les points de charge
                data.forEach(chargePoint => {
                    if (chargePoint.Connections && chargePoint.Connections.length > 0 && chargePoint.Connections[0].PowerKW !== undefined) {
                        // Accéder aux coordonnées de latitude et de longitude
                        var latitude = chargePoint.AddressInfo.Latitude;
                        var longitude = chargePoint.AddressInfo.Longitude;
            
                        // Vérifier si la puissance est supérieure à 43 kW (recharge rapide)
                        var powerKW = chargePoint.Connections[0].PowerKW;
                        if (powerKW > 43) {
                            // Déterminer la couleur du marqueur en fonction de la puissance
                            var markerColor = 'green'; // Puissance supérieure à 43 kW
            
                            // Créer un marqueur pour chaque point de charge avec la couleur déterminée
                            var marker = new google.maps.Marker({
                                position: { lat: latitude, lng: longitude },
                                map: map,
                                title: chargePoint.AddressInfo.Title,
                                icon: {
                                    url: 'http://maps.google.com/mapfiles/ms/icons/' + markerColor + '-dot.png' // Utiliser une icône de couleur déterminée
                                }
                            });
            
                            // Ajouter une info-bulle avec le titre du point de charge
                            var infoWindow = new google.maps.InfoWindow({
                                content: chargePoint.AddressInfo.Title
                            });
            
                            // Afficher l'info-bulle lorsque le marqueur est cliqué
                            marker.addListener('click', function() {
                                infoWindow.open(map, marker);
                            });
  
                            gmarkers.push(marker);
                        }
                    }
                });
            } else {
                console.error('Aucun point de charge trouvé.');
            }
        })
        .catch(error => console.error('Erreur lors de la récupération des points de charge:', error));
  
  }
  
  // Activer le bouton cliqué (trajet/carte)
  function toggleActiveSlow(button) {
  
    for(i=0; i<gmarkers.length; i++){
        gmarkers[i].setMap(null);
    }
  
    // Désactiver 
    var buttons = document.querySelectorAll('.value');
    var form = document.getElementById('form-form');
    var calcBtn = document.getElementById('calc-btn');
    var googleMap = document.getElementById('googleMap');
    var filtre = document.getElementById('filtre-carte');
    var filtre2 = document.getElementById('filtre-carte2');
    form.classList.add('details-hidden')
    calcBtn.classList.add('details-hidden')
    //googleMap.classList.add('selected-carte')
    filtre.classList.remove('hidden-filtre')
    filtre2.classList.remove('hidden-filtre')
  
    buttons.forEach(function(btn) {
    btn.classList.remove('active');
    });
  
    // Activer 
    button.classList.add('active');
  
    var apiKey = '56fa6422-eeff-4be6-a733-92a29cb26fdd';
    var url = 'https://api.openchargemap.io/v3/poi/?output=json&countrycode=FR&maxresults=100000&key=' + apiKey;
    
    return fetch(url)
        .then(response => {
            return response.json();
        })
        .then(data => {
            // Assurez-vous que les données sont disponibles et qu'elles contiennent des points de charge
            if (data && data.length > 0) {
                // Parcourir les points de charge
                data.forEach(chargePoint => {
                    if (chargePoint.Connections && chargePoint.Connections.length > 0 && chargePoint.Connections[0].PowerKW !== undefined) {
                        // Accéder aux coordonnées de latitude et de longitude
                        var latitude = chargePoint.AddressInfo.Latitude;
                        var longitude = chargePoint.AddressInfo.Longitude;
            
                        // Vérifier si la puissance est supérieure à 43 kW (recharge rapide)
                        var powerKW = chargePoint.Connections[0].PowerKW;
                        if (powerKW < 43) {
                            // Déterminer la couleur du marqueur en fonction de la puissance
                            var markerColor = 'orange'; // Puissance supérieure à 43 kW
            
                            // Créer un marqueur pour chaque point de charge avec la couleur déterminée
                            var marker = new google.maps.Marker({
                                position: { lat: latitude, lng: longitude },
                                map: map,
                                title: chargePoint.AddressInfo.Title,
                                icon: {
                                    url: 'http://maps.google.com/mapfiles/ms/icons/' + markerColor + '-dot.png' // Utiliser une icône de couleur déterminée
                                }
                            });
  
                            // Ajouter une info-bulle avec le titre du point de charge
                            var infoWindow = new google.maps.InfoWindow({
                                content: chargePoint.AddressInfo.Title
                            });
            
                            // Afficher l'info-bulle lorsque le marqueur est cliqué
                            marker.addListener('click', function() {
                                infoWindow.open(map, marker);
                            });
  
                        gmarkers.push(marker);
  
                        }
                    }
                });
            } else {
                console.error('Aucun point de charge trouvé.');
            }
        })
        .catch(error => console.error('Erreur lors de la récupération des points de charge:', error));
    
  }
  
  
  function toggleDetails(event) {
  var details = document.getElementById('details');
  var details1 = document.getElementById('navigation-options');
  
  if (!event.target.closest('.panel-body')) {
    details.classList.toggle('details-hidden');
    details1.classList.add('details-hidden'); // Fermer details1
  }
  }
  
  function toggleDetails1(event) {
    var details = document.getElementById('details');
    var details1 = document.getElementById('navigation-options');
  
    if (!event.target.closest('.panel-body')) {
        details1.classList.toggle('details-hidden');
        details.classList.add('details-hidden'); // Fermer details
    }
  }
  
  function preventClosing(event) {
    event.stopPropagation();
  }
  
  // Sélection de tous les éléments avec la classe "station"
  var stationElements = document.querySelectorAll('.station');
  
  // Ajout d'un gestionnaire d'événements à chaque élément station
  stationElements.forEach(function(element) {
    element.addEventListener('click', function() {
        // Supprimer la classe 'selected' de tous les éléments de la station
        stationElements.forEach(function(el) {
            el.classList.remove('selected');
        });
  
        // Ajouter la classe 'selected' à l'élément cliqué
        element.classList.add('selected');
  
        // Récupération de la valeur de l'attribut "value" de l'élément cliqué
        var chargeType = element.getAttribute('value');
        
        // Mettre à jour le contenu du textarea avec la valeur sélectionnée
     });
  });
  
  document.getElementById("calculer").addEventListener("click", () => calcRoute());