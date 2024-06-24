    const initialZoomLevel = 11;
    const initialPosition = { lat: 52.36388108888907, lng: 4.876605157366489 };
    const userToken = "741131bb-88ac-5471-898c-1a978d0c8563";
    const googleApiKey = "AIzaSyDapK2Ot0xiUZ8BO9RqpIGC4wxEbElMgm4";
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

    search = document.createElement('input');
    search.setAttribute("class", "road-embed-map-search");
    search.setAttribute("placeholder", "Enter a location")
    search.setAttribute("type", "text");
    widget.appendChild(search);
    
    const defaultZoomLevel = 11;
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
        zoom: defaultZoomLevel,
        center: new google.maps.LatLng(initialPosition),
        mapTypeControl: false,
        fullscreenControl: false
      }
    );

    const ici = document.getElementById('btnbtn');
    ici.addEventListener('click', function(){

        // Récupérer tous les marqueurs existants sur la carte
        const markers = [];

        // Parcourir les couches de superposition pour trouver les marqueurs
        map.overlayMapTypes.forEach(layer => {
            if (layer instanceof google.maps.MarkerLayer) {
                // Récupérer les marqueurs de la couche de superposition de marqueurs
                layer.getMarkers().forEach(marker => {
                    markers.push(marker);
                });
            }
        });

        // Parcourir les marqueurs pour accéder à leurs propriétés
        markers.forEach(marker => {
            console.log(marker.getPosition()); // Position du marqueur (LatLng)
            console.log(marker.getTitle());    // Titre du marqueur
            // Ajoutez d'autres propriétés de marqueur ici
        });

        console.log(markers, 'markers')
    })

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
    // NOTE: dont use this for preventing attribute xss since it does not escape quotes
    function sanitize(unsafe) {
      sanitizer.innerText = unsafe
      return sanitizer.innerHTML;
    }

    // Set map options
    var mapOptions = {
        center: initialPosition,
        zoom: 7,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var chargePointsArray = [];

    // Create a DirectionsService object to use the route method and get a result for our request
    var directionsService = new google.maps.DirectionsService();

    // Create a DirectionsRenderer object which we will use to display the route
    var directionsDisplay = new google.maps.DirectionsRenderer();

    var all = document.getElementById('all');
    var normal = document.getElementById('normal');
    var fast = document.getElementById('fast');

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

    var Markers = [];

    // Bind the DirectionsRenderer to the map
    directionsDisplay.setMap(map);

    const removeMarkers = () => {
        Markers.forEach((m) => m.setMap(null));
        Markers = [];
    }

    // Function to fetch and display charging points
    function fetchAndDisplayChargePoints(latitude, longitude, selectedChargeType) {
        var apiKey = '56fa6422-eeff-4be6-a733-92a29cb26fdd';
        var url = 'https://api.openchargemap.io/v3/poi/?output=json&maxresults=40&latitude=' + latitude + '&longitude=' + longitude + '&distance=20&distanceunit=KM&key=' + apiKey;

        fetch(url)
            .then(response => {
                return response.json()
            })
            .then(data => {
                // Process and display charging points on the map
                processChargePoints(data, selectedChargeType);
            })
            .catch(error => console.error('Error fetching charging points:', error));
    }

    function getTotalDistance(result) {
        let totalDistance = 0;
        result.routes[0].legs.forEach(leg => {
            totalDistance += leg.distance.value; // Utilisez .value pour obtenir la distance en mètres
        });
        return Math.round(totalDistance / 1000); // Arrondir au kilomètre le plus proche
    }

    // Function to fetch nearest charging point from a given location
    function fetchNearestChargePoint(latitude, longitude, selectedChargeType) {
        var apiKey = '56fa6422-eeff-4be6-a733-92a29cb26fdd';
        var url = 'https://api.openchargemap.io/v3/poi/?output=json&latitude=' + latitude + '&longitude=' + longitude + '&distance=20&distanceunit=KM&key=' + apiKey;

        return fetch(url)
            .then(response => response.json())
            .then(data => {
                // Filter charging points based on selected charge type
                var filteredChargePoints = data.filter(chargePoint => {
                    return selectedChargeType === 'all' ||
                        (selectedChargeType === 'normal' && chargePoint.Connections[0] && chargePoint.Connections[0].PowerKW >= 3 && chargePoint.Connections[0].PowerKW <= 22) ||
                        (selectedChargeType === 'fast' && chargePoint.Connections[0] && chargePoint.Connections[0].PowerKW > 30);
                });
                if (selectedChargeType === 'all') {
                    // Filtrer les bornes qui ont des connexions définies
                    filteredChargePoints = filteredChargePoints.filter(chargePoint => chargePoint.Connections && chargePoint.Connections.length > 0);
                
                    // Trier par ordre décroissant de PowerKW
                    filteredChargePoints.sort((a, b) => {
                        const powerA = a.Connections[0]?.PowerKW || 0; // Utiliser 0 si PowerKW n'est pas défini
                        const powerB = b.Connections[0]?.PowerKW || 0; // Utiliser 0 si PowerKW n'est pas défini
                        return powerB - powerA;
                    });
                }                
                
                if (filteredChargePoints.length > 0) {
                    // Sort the filtered charging points by distance from the current location
                    filteredChargePoints.sort((a, b) => {
                        // Calculate distances from the current location
                        var distanceA = google.maps.geometry.spherical.computeDistanceBetween(
                            new google.maps.LatLng(latitude, longitude),
                            new google.maps.LatLng(a.AddressInfo.Latitude, a.AddressInfo.Longitude)
                        );
                        var distanceB = google.maps.geometry.spherical.computeDistanceBetween(
                            new google.maps.LatLng(latitude, longitude),
                            new google.maps.LatLng(b.AddressInfo.Latitude, b.AddressInfo.Longitude)
                        );

                        // Return the comparison result
                        return distanceA - distanceB;
                    });

                    // Return the first charging point (the nearest one)
                    return filteredChargePoints[0];
                } else {
                    // If no matching charging points found, return null
                    return null;
                }
            })
            .catch(error => console.error('Error fetching nearest charging point:', error));
    }

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
                fetchNearestChargePoint(insufficientChargePoint.lat(), insufficientChargePoint.lng(), selectedChargeType)
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
        
        // Define the calcRoute function
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
                    var destinationCoordinates = result.routes[0].legs[0].end_location;

                    calcNewRoute(result, prevCharge, destinationCoordinates)
                } else {
                    console.log('ok c\'est bon');
                }
                var totalDurationText = getTotalDuration(result);

                const output = document.querySelector('#output');
                output.innerHTML = "<div class='alert-info'>De: " + document.getElementById("from").value + " avec " + charge + " %.<br />à: " + document.getElementById("to").value + " avec " + Math.round(restPercent) + " %.<br /> Distance <i class='fas fa-road'></i> : " + result.routes[0].legs[0].distance.text + ".<br />Durée <i class='fas fa-hourglass-start'></i> : " + totalDurationText;

                removeMarkers();

                // Display route on the map
                directionsDisplay.setDirections(result);
                // Fetch and display charging points along the route
                var route = result.routes[0].overview_path;
                for (var i = 0; i < route.length; i += 5) {
                    //fetchAndDisplayChargePoints(route[i].lat(), route[i].lng(), selectedChargeType);
                }
            } else {
                // Delete route from map
                directionsDisplay.setDirections({ routes: [] });
                // Center map
                map.setCenter(myLatLng);
                // Show error message
                output.innerHTML = "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Impossible de trouver la distance.</div>";
            }
        });
    }

    function calcNewRoute(result, prevCharge, destinationCoordinates) {
        const output = document.querySelector('#output');

        var verifWaypoints = result.request.waypoints;
        
        if (verifWaypoints != undefined && verifWaypoints.length > 0) {
            // Appelez la fonction verifWaypointsCalcNewRoute en passant les mêmes paramètres
            verifWaypointsCalcNewRoute(verifWaypoints, selectedChargeType, result, prevCharge, destinationCoordinates, map);
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

            fetchNearestChargePoint(insufficientChargePoint.lat(), insufficientChargePoint.lng(), selectedChargeType)
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
        var avoidHighwaysStatut = document.getElementById('avoidHighways');
        if (avoidHighwaysStatut.checked) {
            avoidHighwaysStatut = true;
        } else {
            avoidHighwaysStatut = false;
        }

        // Create request
        var request = {
            origin: document.getElementById("from").value,
            destination: document.getElementById("to").value,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: avoidHighwaysStatut
        };

        var capaChargeCar = document.getElementById('capaChargeCar').value;
        var powerKW = insufficientChargePoint.Connections[0].PowerKW

        if (powerKW < capaChargeCar){
            capaChargeCar = powerKW
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
        var lat = insufficientChargePoint.AddressInfo.Latitude
        var lng = insufficientChargePoint.AddressInfo.Longitude
        var apiKey = 'AIzaSyCHKZ2EUvq0Auxg6utOCuO_40eesyG2MNc';
        
        // Construction de l'URL de requête
        var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        
        // Envoi de la requête GET à l'API Geocoding
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Traitement de la réponse de l'API
                if (data.status === 'OK' && data.results.length > 0) {
                    // Récupération de l'adresse à partir des résultats de la réponse
                    addressData = data.results[0].formatted_address; // Assigner la valeur à la variable
                } else {
                    console.error('Erreur lors de la récupération de l\'adresse.');
                }
            })
            .catch(error => console.error('Erreur lors de la requête à l\'API Geocoding:', error));
        
        // Vérifier si l'adresse n'est pas déjà présente dans les waypoints
        var isAddressAlreadyAdded = waypoints.some(waypoint => waypoint.location.query === addressData);

        // Ajouter le nouveau waypoint s'il n'est pas déjà présent
        if (!isAddressAlreadyAdded) {
            waypoints.push({
                location: addressData,
                stopover: true
            });
        }



        request.waypoints = waypoints;
        
        // Re-calculer l'itinéraire avec les nouveaux 
        directionsService.route(request, function (result, updatedStatus) {
            if (updatedStatus == google.maps.DirectionsStatus.OK) {
                // Afficher le nouvel itinéraire sur la carte
                directionsDisplay.setDirections(result);

                // Récupérer la distance entre le dernier waypoint et la destination
                var lastLegIndex = result.routes[0].legs.length - 1;
                var lastLegDistanceData = result.routes[0].legs[lastLegIndex].distance.text;
                var lastLegDistanceDataSansKm = lastLegDistanceData.replace(' km', '');
                var lastLegDistanceDataSansKmSansEspace = lastLegDistanceDataSansKm.replace(/\s+/g, '')
                var remainingDistance = parseFloat(lastLegDistanceDataSansKmSansEspace.replace(',', '.')); // Convertir en nombre

                // pour convertir le pourcentage en kWh
                var chargeKWh = (battery * charge) / 100;

                // savoir la consommation jusqu'à l'arret borne
                var consoDepartBorne = (conso * remainingDistance) / 100;
                
                // savoir le nombre de kw restant en arrivant à la borne
                var resteKwBorne = chargeKWh - consoDepartBorne;
                
                // connaitre les Kw correspondant à 85% de batterie
                var quatreVingtCinq = (battery * 85) / 100;
                
                // connaitre la plage de recharge
                var plageRecharge = quatreVingtCinq - resteKwBorne;
                
                // récupérer le temps de recharge
                var tempsRecharge = (plageRecharge / capaChargeCar) * 60;

                // avoir la conso réelle de la borne a la destination
                var consoReelApresBorne = conso * remainingDistance / 100;

                // avoir le reste de charge en kWh
                var chargeResteKWhApresBorne = quatreVingtCinq - consoReelApresBorne;

                // savoir le pourcentage restant
                var restPercentApresBorne = Math.round((chargeResteKWhApresBorne * 100) / battery);
                if (restPercentApresBorne < 30) {

                    // connaitre le niveau correspondant à 30%
                    var trentePourcent = battery * 30 / 100;

                    // connaitre la plage de kWh avant les 30 %
                    var plagePourcent = quatreVingtCinq - trentePourcent;

                    // convertir les kWh restant en km
                    var prevCharge = (100 * plagePourcent) / conso;

                    calcNewRoute(result, prevCharge, destinationCoordinates);
                } else {
                    console.log('ok');
                }

                var tempsRechargeArrondi = Math.round(tempsRecharge);
                // Créer un objet avec les informations de la borne
                var powerKw = insufficientChargePoint.Connections[0] && insufficientChargePoint.Connections[0].PowerKW ? insufficientChargePoint.Connections[0].PowerKW : "Non renseigné";

                var borneInfo = {
                    temps: tempsRechargeArrondi,
                    titre: insufficientChargePoint.AddressInfo.Title,
                    adresse: addressNotNull(
                        insufficientChargePoint.AddressInfo.AddressLine1,
                        insufficientChargePoint.AddressInfo.Town
                    ) + ", " +
                    addressNotNull(insufficientChargePoint.AddressInfo.Postcode, null),
                    puissance: powerKw
                };
                
            // Vérifier si la nouvelle borne n'existe pas déjà dans le tableau
            var isDuplicate = false;
            for (var i = 0; i < infosBornes.length; i++) {
                if (infosBornes[i].adresse === borneInfo.adresse) {
                    isDuplicate = true;
                    break;
                }
            }

            // Ajouter l'objet au tableau infosBornes uniquement s'il n'existe pas déjà
            if (!isDuplicate) {
                infosBornes.push(borneInfo);
            }


            // Ajouter l'objet au tableau infosBornes après la vérification

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
                    var avoidHighwaysStatut = document.getElementById('avoidHighways');
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
                    bornesHTML += "<p><strong>Temps de recharge:</strong> " + borne.temps + " minutes</p>";
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

    // Create autocomplete objects for all inputs
    var options = {
        types: ['address'], // Limiter les suggestions aux adresses
        componentRestrictions: { country: 'fr' } // Limiter les suggestions à la France
    };

    var input1 = document.getElementById("from");
    var autocomplete1 = new google.maps.places.Autocomplete(input1, options);

    var input2 = document.getElementById("to");
    var autocomplete2 = new google.maps.places.Autocomplete(input2, options);


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