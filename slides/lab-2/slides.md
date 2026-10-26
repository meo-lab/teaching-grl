---
download: true
exportFilename: slides
export:
  waitUntil: load
  wait: 1000
  timeout: 120000
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lab 2
home: ../../
---

# Geodata Scavanger Hunt

## Collect and Document Geospatial Data

One assigned source and one shared study area per group.

---
layout: learning-outcomes
mode: before
meeting: lab-02
---

# Learning Outcomes

After this lab, you will be able to:

<LearningOutcome id="understand-source">

**Explain** what a geospatial source measures and how to interpret its values.

</LearningOutcome>

<LearningOutcome id="prepare-subset">

**Export and check** a usable subset for a specified area of interest.

</LearningOutcome>

<LearningOutcome id="document-source">

**Document and share** the subset so another group can use it in Lab 3.

</LearningOutcome>

---
layout: bonn-two-cols-header
---

# Lab Outline and Deliverables

::left::

<div class="h-full rounded-xl border-2 border-blue-200 bg-blue-50 p-5 text-sm">
<div class="mb-4 text-base font-bold text-blue-900">During the lab</div>

<div class="flex gap-3 mb-5">
<div class="font-mono text-xl font-bold text-blue-700">1</div>
<div><strong>Collect geospatial data.</strong> Find your group's assigned source, crop it to the shared study area, check the result, and upload the subset to Drive.</div>
</div>

<div class="flex gap-3">
<div class="font-mono text-xl font-bold text-blue-700">2</div>
<div><strong>Document your work.</strong> Add two slides: one about the source and acquisition, and one about the prepared subset.</div>
</div>
</div>

::right::

<div class="h-full rounded-xl border-2 border-green-200 bg-green-50 p-5 text-sm">
<div class="mb-4 text-base font-bold text-green-900">Each group submits</div>

<div class="mb-5">
<div class="font-semibold text-green-900">One usable data subset</div>
<div>Covering the provided map bounds and saved in the shared <a href="https://drive.google.com/drive/folders/10w5toFK7Hv9QeXCRJTYN4MgWE2TDqgeT?usp=drive_link" target="_blank" rel="noopener noreferrer" class="text-blue-700 underline">Google Drive folder</a>.</div>
</div>

<div>
<div class="font-semibold text-green-900">Two slides in the <a href="https://docs.google.com/presentation/d/1HjJi4WRuvAumEMTNaau5hb6FNvXkVr5ZdSa612Qz_F8/edit?usp=drive_link" target="_blank" rel="noopener noreferrer" class="text-blue-700 underline">common deck</a></div>
<div><strong>Slide 1:</strong> source and acquisition<br><strong>Slide 2:</strong> subset, metadata, and file link</div>
</div>
</div>

::bottom::

In Lab 3, we will turn these files into working datasets and combine them.

---
layout: bonn-two-cols-header
columns: minmax(0, 1.15fr) minmax(0, 1fr)
---

# Our Study Area

::left::

<StudyAreaMap />

::right::

**Geographic bounds · EPSG:4326**

- W 7.010648° · E 7.222135°
- S 50.657955° · N 50.771430°

**Projected corners · UTM 32N · EPSG:32632**

- SW: E 359,390 · N 5,613,677 m
- SE: E 374,337 · N 5,613,297 m
- NE: E 374,640 · N 5,625,914 m
- NW: E 359,729 · N 5,626,294 m

**UTM extent:** E 359,390–374,640 m; N 5,613,297–5,626,294 m. Coordinates rounded to the nearest metre.

<!--
The geographic rectangle is [west, south, east, north] =
[7.010648159485404, 50.657954797311504, 7.222134975891654, 50.77143017888567].
The four corners were transformed from EPSG:4326 to EPSG:32632 with proj4.
The projected polygon is not exactly axis-aligned in UTM; use the four corners rather than treating SW and NE as a projected rectangle.
-->

---

# Assigned Sources · Groups 1–5

<div class="compact-table lab2-source-table mt-2">

| Group / assigned source | What to collect | Starting point and acquisition route |
|---|---|---|
| **1 · Sentinel-2 optical** (raster) | One mostly cloud-free acquisition; blue, green, red, and near-infrared bands at 10 m. Multiband GeoTIFF. | [Copernicus Browser](https://browser.dataspace.copernicus.eu/): Sentinel-2 L2A → AOI → **Analytical download** of raw bands. Alternative: [Earth Engine](https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED). [Browser guide](https://documentation.dataspace.copernicus.eu/Applications/Browser.html). |
| **2 · Sentinel-1 radar** (raster) | One acquisition; VV and VH backscatter bands as GeoTIFF. Document dB units. | [Sentinel-1 GRD in Earth Engine](https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S1_GRD), which provides preprocessed backscatter. |
| **3 · Terrain elevation** (raster) | NRW DGM1 bare-earth elevation at 1 m, cropped to the AOI. GeoTIFF. | Download intersecting tiles from the [DGM1 directory](https://www.opengeodata.nrw.de/produkte/geobasis/hm/dgm1_tiff/dgm1_tiff/) and crop. [Product page](https://www.bezreg-koeln.nrw.de/geobasis-nrw/produkte-und-dienste/hoehenmodelle/digitale-gelaendemodelle/digitales-gelaendemodell). |
| **4 · Land-cover classes** (raster) | ESA WorldCover **2021** class codes at 10 m; retain the 11-class legend separately. | [ESA WorldCover in Earth Engine](https://developers.google.com/earth-engine/datasets/catalog/ESA_WorldCover_v200), derived from Sentinel-1 and Sentinel-2. |
| **5 · ERA5-Land temperature** (raster + time) | Daily mean 2 m air temperature for **seven consecutive historical days**; dated GeoTIFFs or a documented stack. | [ERA5-Land daily aggregates](https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_DAILY_AGGR): select temperature_2m. This is reanalysis, not a forecast. |

</div>

---

# Assigned Sources · Groups 6–10

<div class="compact-table lab2-source-table mt-2">

| Group / assigned source | What to collect | Starting point and acquisition route |
|---|---|---|
| **6 · Building footprints** (polygons) | OSM building polygons and available attributes. GeoJSON. | [Overpass Turbo](https://overpass-turbo.eu/): zoom to AOI → Wizard with building=* → run → export GeoJSON. |
| **7 · Road and path network** (lines) | OSM roads, streets, and paths with highway classification. GeoJSON line features. | [Overpass Turbo](https://overpass-turbo.eu/): Wizard with highway=* → inspect → retain line features. |
| **8 · Cadastral parcels** (polygons) | Official Flurstücke covering the AOI. GeoJSON or zipped shapefile. | [NRW geodata services](https://www.bezreg-koeln.nrw.de/geobasis-nrw/webdienste/geodatendienste): INSPIRE → Flurstücke/Grundstücke → WFS. Subset and export in QGIS. |
| **9 · Official water features** (lines / polygons) | Rivers, streams, and waterbodies intersecting the AOI; keep available feature types. | [NRW geodata services](https://www.bezreg-koeln.nrw.de/geobasis-nrw/webdienste/geodatendienste): INSPIRE → Gewässernetz → Hydro – Physische Gewässer → WFS. Subset in QGIS. |
| **10 · Nature reserves** (polygons) | Naturschutzgebiete intersecting the AOI; keep names and identifiers. | [NRW LINFOS downloads](https://www.opengeodata.nrw.de/produkte/umwelt_klima/naturschutz/linfos/): download Naturschutzgebiete Shape, clip locally, export GeoJSON or a zipped shapefile. |

</div>

---
layout: bonn-two-cols-header
---

# Two Slides per Group

::left::

## Slide 1 · Source and acquisition

- Explain what the source measures and which variables, units, or classes it contains.
- Give its spatial resolution and observation date or period.
- Link the original source and its documentation.
- Explain how you found, downloaded, or exported the data, including your AOI and key selections.

::right::

## Slide 2 · Prepared subset

- Show a map or screenshot of the exported subset over the study area.
- Record the file format, CRS, coverage, and missing-data convention.
- Link the checked file in the shared Google Drive folder.

::bottom::

Add both slides to the common deck so another group can understand the source and use your file in Lab 3.
