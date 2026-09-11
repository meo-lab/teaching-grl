---
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lecture 2
home: ../
---

# Geospatial Data: Sources, Modalities, and Applications

## Geospatial Representation Learning

---

# Learning Outcomes

<div class="grid grid-cols-2 gap-6 mt-4">

<div>

## Lecture

- Understand and compare major geospatial data sources from GIS, remote sensing, meteorology, geophysics, and environmental monitoring.
- Distinguish common geospatial data modalities, including raster images, vector layers, point data, point clouds, time series, trajectories, and gridded fields.
- Explain key properties of geospatial data, including spatial resolution, temporal resolution, spectral resolution, coverage, uncertainty, and coordinate reference systems.
- Describe common geospatial data formats and access patterns used in Python-based workflows.
- Match geospatial data sources and modalities to suitable environmental and socio-ecological applications.
- Identify practical challenges such as scale mismatch, missing data, sampling bias, spatial autocorrelation, and heterogeneous data quality.

</div>

<div>

## Lab

- Access and preprocess raster, vector, and time-series geospatial data using Python-based tools.
- Combine multiple geospatial data layers into a common spatial reference and resolution.
- Extract training samples or analysis regions from geospatial datasets.
- Evaluate practical limitations of data quality, coverage, scale, and interoperability.

</div>

</div>

---
layout: bonn-section
sectionColor: "#f2c300"
section: coordinates
sectionTitle: Coordinates
---

# Coordinates

<img class="bonn-section-image-sm" src="./figures/Globe_Atlantic.svg.webp" alt="Globe centered on the Atlantic Ocean" />

<div class="bonn-section-citation">
U.S. Government — Extracted from the PDF version of the
<a href="http://www.disam.dsca.mil/pubs/archives.htm" target="_blank" rel="noopener noreferrer"><em>Vol 26-4 2004 DISAM Journal</em></a>
(direct PDF <a href="http://www.disam.dsca.mil/pubs/Archives/Web%20Journal%2026-4.pdf" target="_blank" rel="noopener noreferrer">[1]</a>),
via <a href="https://commons.wikimedia.org/wiki/File:Globe_Atlantic.svg" target="_blank" rel="noopener noreferrer">Wikipedia</a>.
</div>

---

# Coordinates and Location

<blockquote>
How many coordinates do we need to uniquely define a spatio-temporal location?
</blockquote>

<div class="grid grid-cols-2 gap-6 mt-8">

<div class="p-5 rounded-xl border box-card box-1">
<h3>3 spatial dimensions</h3>

<div class="mt-4 text-lg leading-snug text-blue-800">
<span class="font-serif italic">Cartesian (x, y, z)</span> or <span class="font-serif italic"> Spherical/Ellipsoidal (λ, φ, r)</span> or <span class="font-serif italic">or UTM Projections (Easting, Northing, Height)</span>
</div>

<div class="mt-3 text-gray-700">
Where is it in space?
</div>
</div>

<div class="p-5 rounded-xl border box-card box-2">
<h3>1 temporal dimension</h3>

<div class="mt-4 text-2xl text-blue-800">
<span class="font-serif italic">t</span>
</div>

<div class="mt-3 text-gray-700">
When does it occur?
</div>
</div>

</div>

---

# Cartesian Coordinates x,y,z

###


<div class="grid grid-cols-2 gap-8 mt-6 items-center">

<div>

A location can be represented by three orthogonal coordinates $\mathbf{p} = (x, y, z)$ in an <a href="https://en.wikipedia.org/wiki/Earth-centered,_Earth-fixed_coordinate_system">Earth-Centered, Earth-Fixed (ECEF)</a> coordinate system

</div>


<div class="flex justify-center">
  <img
    src="./figures/cartesian.png"
    class="w-full h-[300px] object-contain rounded-xl"
    alt="Cartesian coordinate system illustration"
  />
</div>

</div>

---

# Spherical Coordinates

###


Expressing location on the surface of Earth is often more practical than working directly in 3D Cartesian coordinates
$
x,y,z \mapsto \lambda, \varphi, r
$
of longitude $\lambda$, latitude $\varphi$, and constant radius $r$

<div class="grid grid-cols-2 gap-8 mt-6 items-center">
<div>
<div class="grid grid-cols-2 gap-5">
<div>
<div class="text-lg font-bold text-blue-800">Spherical to Cartesian</div>

$$
x = r \cos\varphi \cos\lambda
$$

$$
y = r \cos\varphi \sin\lambda
$$

$$
z = r \sin\varphi
$$
</div>

<div>
<div class="text-lg font-bold text-blue-800">Cartesian to spherical</div>

$$
r = \sqrt{x^2 + y^2 + z^2}
$$

$$
\lambda = \operatorname{atan2}(y, x)
$$

$$
\varphi = \arcsin\left(\frac{z}{r}\right)
$$
</div>

</div>

</div>

<div class="flex justify-center">
  <img
    src="./figures/cartesian_sppherical.png"
    class="w-full h-[300px] object-contain rounded-xl"
    alt="Cartesian and spherical coordinate system illustration"
  />
</div>

</div>

---

# Ellipsoidal Coordinates

###

But the Earth is not a sphere: It is an ellipsoid.

<div class="grid grid-cols-2 gap-8 mt-6 items-center">
<div>
<div class="text-lg font-bold text-blue-800">Geodetic to Cartesian</div>

$$
\begin{aligned}
x &= (N(\varphi) + h)\cos\varphi\cos\lambda \\
y &= (N(\varphi) + h)\cos\varphi\sin\lambda \\
z &= \left((1-e^2)N(\varphi) + h\right)\sin\varphi
\end{aligned}
$$

$$
\begin{aligned}
N(\varphi) &= \frac{a}{\sqrt{1-e^2\sin^2\varphi}} \\
e^2 &= \frac{a^2-b^2}{a^2}
\end{aligned}
$$

<div class="text-lg font-bold text-blue-800">Cartesian to Geodetic</div>

<div class="mt-4 text-gray-700">
The inverse is usually computed iteratively. See
<a href="https://en.wikipedia.org/wiki/Geographic_coordinate_conversion#From_ECEF_to_geodetic_coordinates" target="_blank" rel="noopener noreferrer">
Wikipedia
</a>.
</div>

</div>

<div class="flex justify-center">
  <img
    src="./figures/ellipsoidyz.png"
    class="w-full h-[300px] object-contain rounded-xl"
    alt="Ellipsoidal Earth model"
  />
</div>

</div>

---

# World Geodetic System 1984 (WGS 84)

###

WGS 84 is the global reference system used by GPS and most web mapping workflows.


<div class="grid grid-cols-2 gap-8 mt-2 items-start">

<div>

<img
    src="./figures/WGS84_mean_Earth_radius.svg"
    class="w-full h-[200px] object-contain rounded-xl"
    alt="WGS 84 mean Earth radius illustration"
  />
</div>

<div class="w-full">
  <div class="flex items-start justify-center">
  </div>
  <img
    src="./figures/Latitude_and_Longitude_of_the_Earth.svg"
    class="w-full h-[205px] object-contain object-bottom rounded-xl"
    alt="Latitude and longitude of the Earth"
  />
</div>

</div>



---

# Cylindrical Map Projections and Web Mercator

<div class="grid grid-cols-[0.9fr_1.1fr] gap-6 mt-3 items-stretch">

<div class="flex min-h-[305px] flex-col">

### Cylindrical projections - Mercator

A cylinder touches or cuts the globe along a line or lines. The classic case is a cylinder around the equator.

<div class="mt-2 h-[150px] flex items-center justify-center">
  <img
    src="./figures/Central_cylindrical_light_projection.svg"
    class="w-full h-[120px] object-contain"
    alt="Central cylindrical projection illustration"
  />
</div>

<blockquote style="margin-top: auto; min-height: 3.1rem;">
Cylindrical projections minimize distortion along their standard line(s).
</blockquote>


</div>

<div class="flex min-h-[305px] flex-col">

### Web Mercator

Web Mercator is the projection used by many web maps. It is a cylindrical, conformal projection: local shapes are preserved, but areas grow strongly toward the poles.

<img
  src="./figures/Equirectangular_projection_SW.jpg"
  class="mt-2 w-full h-[150px] object-contain rounded-xl"
  alt="World map in a rectangular projection"
/>

<blockquote style="margin-top: auto; min-height: 3.1rem;">
Web maps trade area accuracy for visually stable local shapes and simple tiled rendering.
</blockquote>

</div>



</div>

---

# Cylindrical Map Projections and UTM

<div class="grid grid-cols-[0.9fr_1.1fr] gap-6 mt-3 items-stretch">

<div class="flex min-h-[305px] flex-col">

### Cylindrical projections - UTM

The Universal Transverse Mercator system rotates the cylinder: each zone uses a transverse cylinder around a local central meridian.

<div class="mt-2 h-[150px] flex items-center justify-center">
  <img
    src="./figures/Utmzylinderrp.jpg"
    class="w-full h-[115px] object-contain rounded-xl"
    alt="UTM transverse cylinder projection illustration"
  />
</div>

<blockquote style="margin-top: auto; min-height: 3.1rem;">
UTM turns longitude/latitude into local metric coordinates: easting and northing.
</blockquote>

</div>

<div class="flex min-h-[305px] flex-col">

### Universal Transverse Mercator (UTM)

Pre-defined UTM zones give geodata local coordinate systems with comparatively low distortion inside each zone.

<div class="mt-2 h-[150px] flex items-center justify-center">
  <img
    src="./figures/Utm-zones.jpg"
    class="w-full h-[150px] object-contain rounded-xl"
    alt="UTM zones map"
  />
</div>

<blockquote style="margin-top: auto; min-height: 3.1rem;">
UTM uses different cylinders to avoid local distortions.
</blockquote>

</div>

</div>

---

# Radius: Atmosphere and Ocean

<div class="grid grid-cols-2 gap-8 mt-6 items-center">

<div>

Geospatial fields are not only horizontal.

They also vary vertically:

- wind fields change across atmospheric columns
- ocean currents differ at the surface and at depth
- temperature, humidity, pressure, and salinity depend on height or depth
- many Earth-system processes require a vertical coordinate

<blockquote>
Location often means latitude, longitude, and height or depth.
</blockquote>

</div>

<div>
  <div class="flex justify-center">
  <img
    src="./figures/Fig_1.4.1_Atmospheric_circulation_cells,_dominant_wind_directions.png"
    class="w-full h-[310px] object-contain rounded-xl"
    alt="Atmospheric circulation cells and dominant wind directions"
  />
  </div>
  <div class="figure-copyright">
  Figure: University of Exeter, <a href="https://commons.wikimedia.org/wiki/File:Fig_1.4.1_Atmospheric_circulation_cells,_dominant_wind_directions.png" target="_blank" rel="noopener noreferrer"><em>Atmospheric circulation cells, dominant wind directions, key ocean basins, surface currents and deep water formation sites</em></a>. Licensed under CC-BY-SA: Creative Commons Attribution-Share Alike 4.0 International. The rest of this slide deck remains CC-BY-NC.
  </div>
</div>

</div>

---

# Time: The Earth is Dynamic

<div class="grid grid-cols-2 gap-8 mt-6 items-start">

<div>
  <img
    src="./figures/Atmospheric_CO2.webp"
    class="w-full h-[330px] object-contain rounded-xl"
    alt="Atmospheric carbon dioxide time series"
  />
  <div class="figure-copyright">
  Figure: NASA Science, <a href="https://science.nasa.gov/earth/explore/earth-indicators/carbon-dioxide/" target="_blank" rel="noopener noreferrer">Carbon Dioxide</a>.
  </div>
</div>

<div>
  <img
    src="./figures/modis-ndvi-time-series-animation.gif"
    class="w-full h-[330px] object-contain rounded-xl"
    alt="MODIS NDVI time series animation"
  />
  <div class="figure-copyright">
  Figure: Google Earth Engine, <a href="https://developers.google.com/earth-engine/tutorials/community/modis-ndvi-time-series-animation" target="_blank" rel="noopener noreferrer">MODIS NDVI time series animation</a>. Licensed under CC-BY.
  </div>
</div>

</div>


---

# Time: Common Frequencies

###

Earth observations contain processes at many characteristic temporal frequencies.

<div class="compact-table">

| Time scale | Frequency | Examples |
|---|---|---|
| Seconds to minutes | High frequency | Wind gusts, turbulence, lightning, traffic, waves, sensor noise |
| Minutes to hours | Sub-daily | Cloud motion, precipitation cells, tides, urban mobility, river discharge |
| ~12 hours | Semi-diurnal | Ocean tides, coastal water levels |
| 24 hours | Daily / diurnal | Temperature cycle, solar radiation, human activity, vegetation |
| Several days | Weather | Storms, pressure systems, cloud regimes, heatwaves, cold fronts |
| Weekly | Anthropogenic | Commuting, energy use, shipping patterns, some air pollution signals |
| Monthly / ~29.5 days | Lunar | Spring-neap tide cycle, moon-related illumination effects |
| Seasonal / annual | Yearly | Phenology, crop cycles, snow cover, monsoon, sea ice, temperature |
| Interannual | 2-7 years | ENSO / El Nino, drought cycles, vegetation anomalies |
| Decadal | 10+ years | Climate variability, land-use change, glacier retreat, urban expansion |
| Multi-decadal to centennial | Long-term trend | Climate change, sea-level rise, ecosystem shifts |

</div>

---
layout: bonn-section
sectionColor: "#4f50ba"
section: remote-sensing
sectionTitle: Remote Sensing
---

# Remote Sensing

<img class="bonn-section-image-sm" src="./figures/epic-earth-globespin_no_bg.gif" alt="Coordinate reference system illustration" />

<div class="bonn-section-citation">
<a href="https://saylordotorg.github.io/text_essentials-of-geographic-information-systems/s05-03-geographic-information-systems.html" target="_blank" rel="noopener noreferrer">
Campbell &amp; Shin (2011), Figure 1.8.
</a>
</div>

---
section: remote-sensing
sectionTitle: Remote Sensing
---

# Overview Section - Data Sources

<div class="relative flex justify-center h-[360px] mt-1">
  <img
    src="./figures/geospatial-data-sources-overview.svg"
    class="w-full h-[360px] object-contain"
    alt="A globe surrounded by the three themes Remote Sensing, Geo-information Systems, and Models and Re-analysis Products"
  />
  <img
    src="./figures/Globe_Atlantic.svg"
    class="absolute left-1/2 top-[72px] w-[204px] h-[205px] -translate-x-1/2 object-contain drop-shadow-lg"
    alt="Globe centered on the Atlantic Ocean"
  />
</div>

---
section: remote-sensing
sectionTitle: Remote Sensing
---

# Overview Section - Data Formats

<div class="relative flex justify-center h-[360px] mt-1">
  <img
    src="./figures/geospatial-data-overview.svg"
    class="w-full h-[360px] object-contain"
    alt="A globe surrounded by point, line, polygon, and raster data representations"
  />
  <img
    src="./figures/Globe_Atlantic.svg"
    class="absolute left-1/2 top-[72px] w-[204px] h-[205px] -translate-x-1/2 object-contain drop-shadow-lg"
    alt="Globe centered on the Atlantic Ocean"
  />
</div>


---
section: remote-sensing
sectionTitle: Remote Sensing
---

# Active and Passive Remote Sensing

<div class="grid grid-cols-2 gap-8 mt-2">

<div>

## Passive Remote Sensing

<img
  src="./figures/passive-remote-sensing.png"
  class="w-full h-[205px] object-contain rounded-xl"
  alt="Passive remote sensing using sunlight reflected from Earth's surface"
/>

<div class="mt-3 text-[1.02rem] leading-snug text-center text-gray-700">
Sunlight → reflected → sensed by the satellite
</div>

<div class="mt-3 text-center">
<strong class="text-blue-800">Example:</strong> optical satellites
</div>

</div>

<div>

## Active Remote Sensing

<img
  src="./figures/active-remote-sensing.png"
  class="w-full h-[205px] object-contain rounded-xl"
  alt="Active remote sensing using energy emitted by a satellite and reflected from Earth's surface"
/>

<div class="mt-3 text-[1.02rem] leading-snug text-center text-gray-700">
Satellite emits energy → reflected → sensed
</div>

<div class="mt-3 text-center">
<strong class="text-blue-800">Examples:</strong> nadir lidar and side-looking radar
</div>

</div>

</div>

<!--
Contrast passive sensors, which use sunlight, with active sensors, which emit their own signal. Use the examples to introduce optical, lidar, and radar observations.
-->

---
section: remote-sensing
sectionTitle: Remote Sensing
---

# Earth Observation Satellites

## Passive Remote Sensing - Examples from 07.02.2020

<div class="grid grid-cols-3 gap-6 mt-3 text-center">

<div>
  <img
    src="./figures/bonn_VHR.png"
    class="w-full h-[235px] object-contain rounded-xl"
    alt="Very high resolution RGB image of Bonn on 7 February 2020"
  />
  <h3 class="mt-3">High Resolution</h3>
  <div class="text-gray-700">e.g., WorldView-3, PlanetScope, &lt; 10 m</div>
</div>

<div>
  <img
    src="./figures/bonn_S2.png"
    class="w-full h-[235px] object-contain rounded-xl"
    alt="Medium resolution Sentinel-2 image of Bonn on 7 February 2020"
  />
  <h3 class="mt-3">Medium Resolution 10m-30m</h3>
  <div class="text-gray-700">Sentinel-2, 13-band multispectral</div>
</div>

<div>
  <img
    src="./figures/bonn_modis.png"
    class="w-full h-[235px] object-contain rounded-xl"
    alt="Low resolution MODIS image of Bonn on 7 February 2020"
  />
  <h3 class="mt-3">Low Resolution</h3>
  <div class="text-gray-700">MODIS, 250m - 1km, 36-band multispectral</div>
</div>

</div>


---
section: remote-sensing
sectionTitle: Remote Sensing
---

# Weather and Meteorological Satellites

## Passive Remote Sensing

<div class="grid grid-cols-[3fr_2fr] gap-5 mt-1 items-center">

  <div>
    <div class="mb-1.5 font-semibold text-[0.85rem] text-blue-900">METEOSAT — Geostationary Orbit (~36 000 km)</div>
    <div class="mb-1.5 flex gap-3 text-[0.78rem] text-gray-600">
      <span>📍 Fixed view over Europe &amp; Africa</span>
      <span>🔭 500 m – 2 km</span>
      <span>🕐 Every 10 min</span>
    </div>
    <a
      href="https://zoom.earth/maps/satellite/#view=50.7,7.1,3.63z"
      target="_blank"
      rel="noopener noreferrer"
      title="Open the live Zoom Earth satellite view"
    >
      <img
        src="./figures/zoom-earth-bonn-satellite.png"
        class="w-full h-[265px] object-contain rounded-xl"
        alt="Zoom Earth live satellite map centered over Europe"
      />
    </a>
    <div class="mt-1 text-[0.7rem] leading-tight text-center text-gray-500">
      Click to open the live satellite view. Source: <a href="https://zoom.earth/maps/satellite/#view=50.7,7.1,3.63z" target="_blank" rel="noopener noreferrer">Zoom Earth</a>.
    </div>
  </div>

  <div class="flex flex-col items-center">
    <div class="mb-1.5 font-semibold text-[0.85rem] text-blue-900 text-center">DSCOVR EPIC — L1 Lagrange Point (~1.5M km)</div>
    <div class="mb-1.5 flex flex-col gap-0.5 text-[0.78rem] text-gray-600 text-center">
      <span>📍 Full sunlit Earth in every image</span>
      <span>🔭 8 – 20 km &nbsp;·&nbsp; 🕐 Every ~2 h</span>
    </div>
    <img
      src="./figures/epic-earth-globespin.gif"
      class="h-[195px] object-contain rounded-xl mx-auto"
      alt="DSCOVR EPIC — Earth Polychromatic Imaging Camera, animated globe spin"
    />
    <div class="mt-1.5 text-[0.7rem] leading-tight text-center text-gray-500">
      DSCOVR EPIC — NASA / Wikimedia Commons. Public domain.
    </div>
  </div>

</div>

<!--
Use the live satellite view to introduce weather satellites and broad, frequently updated coverage. Point out large-scale cloud systems and revisit the role of thermal observations.
-->

---
section: remote-sensing
sectionTitle: Remote Sensing
---

# Takeaways --- Passive Remote Sensing

<div class="grid grid-cols-2 gap-8 mt-2">

<div>

<img
  src="./figures/passive-remote-sensing.png"
  class="w-full h-[205px] object-contain rounded-xl"
  alt="Passive remote sensing using sunlight reflected from Earth's surface"
/>

<div class="mt-3 text-[1.02rem] leading-snug text-center text-gray-700">
Sunlight → reflected → sensed by the satellite
</div>

<div class="mt-3 text-center">
<strong class="text-blue-800">Example:</strong> optical satellites
</div>

</div>

<div class="mt-1 text-left text-[1.08rem] leading-[1.2] text-gray-700">

<ul class="mt-2 space-y-2 text-left">
  <li>Uses reflected sunlight by day or emitted thermal radiation day and night.</li>
  <li>Clouds and the atmosphere can obscure optical observations.</li>
  <li>Resolution trade-offs span space, spectrum, time, and radiometry.</li>
  <li>Higher spatial resolution does not inherently mean fewer bands.</li>
  <li>Very-high-resolution imagery is often commercial; coarser data are often open.</li>
  <li>Coarser sensors usually cover wider areas more frequently.</li>
  <li>Illumination and viewing geometry affect the signal.</li>
  <li>Natural-colour imagery is intuitive; reflectance requires atmospheric correction.</li>
</ul>

</div>

</div>

---
section: remote-sensing
sectionTitle: Remote Sensing
---

# Active Remote Sensing - RADAR and LIDAR

<div class="grid grid-cols-3 gap-6 mt-3 text-center">

<div>
  <img
    src="./figures/bonn_S1.png"
    class="w-full h-[235px] object-contain rounded-xl"
    alt="Sentinel-1 radar image of Bonn"
  />
  <h3 class="mt-3">Sentinel-1 SAR Raster</h3>
  <div class="text-gray-700">Side-looking radar processed as a pixel grid</div>
</div>

<div>
  <img
    src="./figures/radar_altimetry_credits__ADS_Figure_Saskia_Esselborn_GFZ.png"
    class="w-full h-[235px] object-contain rounded-xl"
    alt="Nadir radar altimetry measurements along satellite tracks"
  />
  <h3 class="mt-3">Radar Altimetry Tracks</h3>
  <div class="text-gray-700">Nadir measurements along point tracks</div>
</div>

<div>
  <img
    src="./figures/bonn_gedi_zoom.png"
    class="w-full h-[235px] object-contain rounded-xl"
    alt="Detailed view of GEDI lidar footprints in Bonn"
  />
  <h3 class="mt-3">GEDI Lidar Footprints</h3>
  <div class="text-gray-700">Nadir samples along point tracks</div>
</div>

</div>

<!--
Contrast Sentinel-1 imagery processed as a raster with the point tracks produced by nadir radar altimetry and GEDI lidar. Emphasize that active sensing can produce different spatial data formats.
-->

---
section: remote-sensing
sectionTitle: Remote Sensing
---

# Geometry of side-looking RADAR 

<div class="grid grid-cols-3 gap-7 mt-2 items-start">

<div class="col-span-2">
  <img
    src="./figures/radar-foreshortening.svg"
    class="w-full h-[345px] object-contain"
    alt="Side-looking radar geometry showing foreshortening, layover, and radar shadow"
  />
</div>

<div>

## Example: TerraSAR-X

  <img
    src="./figures/Temporal-mean-image-of-TerraSAR-X-data-Sensor-look-direction-left-to-right-flight_W640.jpg"
    class="w-full h-[305px] object-contain rounded-xl"
    alt="Temporal mean TerraSAR-X radar image with sensor look direction from left to right"
  />

  <div class="mt-2 text-[0.68rem] leading-tight text-gray-500">
    Figure uploaded by
    <a href="https://www.researchgate.net/profile/Richard-Bamler" target="_blank" rel="noopener noreferrer">Richard Bamler</a>.
  </div>

</div>

</div>

---
section: remote-sensing
sectionTitle: Remote Sensing
---

# LIDAR Backscatter for Vegetation Canopy

<div class="grid grid-cols-2 gap-8 mt-1 items-start">

<div>

## Sampling Geometry

  <img
    src="./figures/gedi-waveform-explanation.png"
    class="w-full h-[310px] object-contain"
    alt="Comparison of GEDI and other lidar platforms, footprint sizes, and spatial sampling patterns"
  />

  <div class="mt-1 text-[0.66rem] leading-tight text-center text-gray-500">
    Figures in both panels: NASA and University of Maryland.
  </div>

</div>

<div>

## Canopy Structure

  <img
    src="./figures/GEDI1_cretidtsUniversity_of_Maryland_NASA.png"
    class="w-full h-[310px] object-contain"
    alt="GEDI lidar waveform measurements showing Amazon tree canopy structure and canopy height"
  />

</div>

</div>

<!--
Introduce GEDI's footprint and sampling geometry before showing the resulting canopy-height profile. Connect the lidar return waveform to vertical vegetation structure.
-->

---
section: remote-sensing
sectionTitle: Remote Sensing
---

# Gravity Measurements from Two Satellites

<div class="grid grid-cols-3 gap-5 mt-2 items-start text-center">

<div>

## GRACE Follow-On

  <div class="h-[270px] flex items-center justify-center">
    <img
      src="./figures/grace-fo-satellite_768p.jpg"
      class="w-full max-h-[250px] object-contain rounded-xl"
      alt="Illustration of the two GRACE Follow-On satellites orbiting Earth"
    />
  </div>

  <div class="mt-1 text-[0.68rem] leading-tight text-gray-500">
    Figure: <a href="https://grace.jpl.nasa.gov/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbk1EIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--d3a40f736a59795797a54a45b9897b80606fc0f3/grace-fo-satellite_768p.jpg?disposition=inline" target="_blank" rel="noopener noreferrer">NASA/JPL</a>.
  </div>

</div>

<div>

## Ground Track

  <div class="h-[270px] flex items-center justify-center">
    <img
      src="./figures/grace_tracks_2017_credits_(Ch_Dahle_GFZ).gif"
      class="w-full max-h-[260px] object-contain rounded-xl"
      alt="GRACE satellite ground tracks over Europe, January 2017"
    />
  </div>

  <div class="mt-1 text-[0.68rem] leading-tight text-gray-500">
    Ground Track GRACE, January 2017. Credit: Ch. Dahle, GFZ.
  </div>

</div>

<div>

## GRACE Geoid

  <div class="h-[270px] flex items-center justify-center">
    <img
      src="./figures/GRACE_globe_animation.gif"
      class="w-full max-h-[270px] object-contain"
      alt="Animated GRACE geoid rotating around Earth"
    />
  </div>

  <div class="mt-1 text-[0.68rem] leading-tight text-gray-500">
    Animation: <a href="https://upload.wikimedia.org/wikipedia/commons/7/78/GRACE_globe_animation.gif" target="_blank" rel="noopener noreferrer">Wikipedia</a>; NASA/JPL/University of Texas Center for Space Research.
  </div>

</div>

</div>

<!--
Introduce GRACE as an active measurement system that infers Earth's changing gravity field from two satellites flying in formation. Use the rotating geoid to show the resulting global representation.
-->

---
section: remote-sensing
sectionTitle: Remote Sensing
---

# Takeaways --- Active Remote Sensing

<div class="grid grid-cols-2 gap-8 mt-2">

<div>

<img
  src="./figures/active-remote-sensing.png"
  class="w-full h-[205px] object-contain rounded-xl"
  alt="Active remote sensing: sensor emits its own signal and measures the return"
/>

<div class="mt-3 text-[1.02rem] leading-snug text-center text-gray-700">
Sensor emits signal → return measured
</div>

<div class="mt-3 text-center">
<strong class="text-blue-800">Examples:</strong> SAR, LiDAR, radar altimetry
</div>

</div>

<div class="mt-1 text-left text-[1.08rem] leading-[1.2] text-gray-700">

<ul class="mt-2 space-y-2 text-left">
  <li>Carries its own illumination — <strong>independent of sunlight</strong>, enabling imaging at night and in polar winter.</li>
  <li><strong>Penetrates clouds</strong> and light rain (radar), overcoming a key limitation of optical sensors.</li>
  <li>Measures <strong>physical surface properties</strong> directly: backscatter, elevation, distance, or canopy structure.</li>
  <li>SAR captures <strong>surface roughness, moisture, and deformation</strong> through phase and amplitude.</li>
  <li>Radar altimetry delivers precise <strong>surface height</strong> along nadir tracks — not a full 2D image.</li>
  <li>LiDAR records <strong>3D point clouds</strong>: tree height, building geometry, terrain beneath vegetation.</li>
  <li>Shorter wavelengths (LiDAR) give finer detail; longer wavelengths (L-band radar) penetrate canopy and soil.</li>
</ul>

</div>

</div>

<!--
Contrast with passive sensing: active sensors are self-illuminating, all-weather capable, and measure geometry and physical properties rather than reflected radiance. Emphasise night/cloud capability and the variety of active modalities: SAR, altimetry, LiDAR.
-->


---
layout: bonn-section
sectionColor: "#4f50ba"
section: geo-information-science
sectionTitle: Geo-information Science
---

# Geo-information Science Data

<img class="bonn-section-image-sm" src="./figures/gis.jpg" alt="Coordinate reference system illustration" />

<div class="bonn-section-citation">
<a href="https://saylordotorg.github.io/text_essentials-of-geographic-information-systems/s05-03-geographic-information-systems.html" target="_blank" rel="noopener noreferrer">
Campbell &amp; Shin (2011), Figure 1.8.
</a>
</div>

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Geo-information Science

<div class="grid grid-cols-[1fr_2fr] gap-8 mt-1 items-center">

<div class="flex flex-col items-center">
  <img
    src="./figures/gis.jpg"
    class="h-[320px] object-contain rounded-xl"
    alt="GIS layers diagram: customers, streets, parcels, elevation, and land use stacked above the real world"
  />
  <div class="mt-1 text-[0.7rem] text-gray-400 text-center">Campbell &amp; Shin (2011), Fig. 1.8</div>
</div>

<div class="text-[1.05rem] leading-snug text-gray-700">

GIS organises geographic information as **stacked, queryable layers** — each layer aligns to the same coordinate reference system and carries thematic information about the world.

<div class="mt-4 grid grid-cols-2 gap-3">
  <div class="p-3 rounded-xl bg-green-50 border border-green-200">
    <div class="font-semibold text-green-800 mb-1">Vector layers</div>
    <div class="text-[0.85rem]">Points, lines, polygons + attribute table</div>
  </div>
  <div class="p-3 rounded-xl bg-blue-50 border border-blue-200">
    <div class="font-semibold text-blue-800 mb-1">Raster layers</div>
    <div class="text-[0.85rem]">Grids of continuous values: elevation, imagery</div>
  </div>
</div>

<div class="mt-4 text-[0.88rem] text-gray-600">
<strong class="text-gray-800">Key data sources:</strong> OpenStreetMap, administrative databases, land use / land cover classifications, cadastral records, sensor networks.
</div>

</div>

</div>

<!--
GIS organises thematic information in layers that can be overlaid, queried, and analysed spatially. Each layer is either a vector dataset (geometry + attributes) or a raster grid. Combining layers from different sources — roads, parcels, land cover, elevation — is the core power of GIS.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Vector Data — Geometry + Attributes

<img
  src="./figures/vector-geometry-types.svg"
  class="w-full h-[205px] object-contain mt-1"
  alt="The three vector geometry types: points, lines, and polygons, each shown with example features and an attribute table"
/>

<div class="grid grid-cols-3 gap-4 mt-3 text-[0.88rem]">
  <div class="p-3 rounded-xl bg-green-50 border border-green-200">
    <div class="font-semibold text-green-800 mb-1">🟢 Points</div>
    <div class="text-gray-700 text-[0.82rem]">Zero-dimensional locations: weather stations, cities, GPS waypoints, species occurrence records.</div>
  </div>
  <div class="p-3 rounded-xl bg-blue-50 border border-blue-200">
    <div class="font-semibold text-blue-800 mb-1">🔵 Lines</div>
    <div class="text-gray-700 text-[0.82rem]">Ordered vertex sequences: roads, rivers, coastlines, pipelines, power lines, flight paths.</div>
  </div>
  <div class="p-3 rounded-xl bg-pink-50 border border-pink-200">
    <div class="font-semibold text-pink-800 mb-1">🔴 Polygons</div>
    <div class="text-gray-700 text-[0.82rem]">Closed rings enclosing area: administrative units, building footprints, land-use patches, parcels.</div>
  </div>
</div>

<!--
Every feature in a vector dataset combines geometry (where?) with an attribute table (what?). Spatial queries join geometry and attributes: "find all farms within 10 km of a river that are larger than 50 ha." The power of GIS lies in these combined spatial + semantic queries across multiple layers.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# OpenStreetMap --- the Wikipedia of geodata

<div class="grid grid-cols-[1fr_70px_1fr] gap-4 mt-2 items-center text-center">

<div>

## OSM Database

<img
  src="./figures/osm_popp_db.png"
  class="w-full h-[285px] object-contain rounded-xl"
  alt="OpenStreetMap database features around Poppelsdorf shown as points, lines, and polygons"
/>

<div class="mt-2 text-[1.05rem] font-semibold text-blue-800">
Points, lines, and polygons
</div>

</div>

<div class="flex flex-col items-center justify-center text-blue-800">
  <div class="text-[0.82rem] leading-tight font-semibold">Style and<br />rasterize</div>
  <div class="mt-2 text-4xl">→</div>
</div>

<div>

## OSM Background Map

<img
  src="./figures/osm_popp.png"
  class="w-full h-[285px] object-contain rounded-xl"
  alt="Styled OpenStreetMap background map around Poppelsdorf"
/>

<div class="mt-2 text-[1.05rem] font-semibold text-blue-800">
Rendered raster tiles
</div>

</div>

</div>

<div class="mt-1 text-[0.66rem] leading-tight text-center text-gray-500">
Map data © OpenStreetMap contributors.
</div>

<!--
OpenStreetMap stores tagged vector features rather than a fixed map image. Styling and rasterization transform the database into familiar background-map tiles.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

<script setup>
import { ref } from 'vue'

const initialWmsUrl = 'https://ows.terrestris.de/osm/service?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=OSM-WMS&STYLES=&SRS=EPSG:4326&BBOX=7.0875,50.7225,7.0967,50.7276&WIDTH=512&HEIGHT=300&FORMAT=image/png'
const wmsUrlInput = ref(initialWmsUrl)
const submittedWmsUrl = ref(initialWmsUrl)
const wmsError = ref('')

function loadWmsMap() {
  try {
    const url = new URL(wmsUrlInput.value.trim())
    if (!['http:', 'https:'].includes(url.protocol))
      throw new Error('unsupported protocol')

    wmsError.value = ''
    submittedWmsUrl.value = url.toString()
  }
  catch {
    submittedWmsUrl.value = ''
    wmsError.value = 'Please enter a valid http or https image URL.'
  }
}

function handleWmsImageError() {
  wmsError.value = 'The map image could not be loaded. Check the URL and BBOX values.'
}

function handleWmsImageLoad() {
  wmsError.value = ''
}
</script>

# Web Mapping Service (WMS) API

<div class="mt-1 text-[0.92rem] text-gray-700">
The <strong class="text-blue-800">bounding box (BBOX)</strong> controls the geographic area shown in the returned raster image.
</div>

<form class="mt-2 flex gap-2" @submit.prevent="loadWmsMap">
  <input
    v-model="wmsUrlInput"
    type="text"
    spellcheck="false"
    aria-label="WMS GetMap URL"
    class="min-w-0 flex-1 rounded-lg border-2 border-blue-700 bg-white px-3 py-2 font-mono text-[0.82rem] leading-tight text-gray-800 shadow-sm outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
  />
  <button
    type="submit"
    class="shrink-0 rounded-lg bg-blue-800 px-5 py-2 text-[0.92rem] font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
  >
    Load map
  </button>
</form>

<div class="mt-2 flex items-start gap-4 text-[0.72rem] leading-snug text-gray-600">
  <div class="shrink-0 rounded-md bg-yellow-100 px-2.5 py-1 font-mono font-bold text-blue-900 ring-1 ring-yellow-400">
    BBOX = WEST, SOUTH, EAST, NORTH
  </div>
  <div>
    Change both longitudes to move east or west and both latitudes to move north or south. Narrower coordinate ranges zoom in.
  </div>
</div>

<div class="relative mt-2 flex h-[258px] items-center justify-center overflow-hidden rounded-xl border border-gray-300 bg-gray-100">
  <img
    v-if="submittedWmsUrl"
    :src="submittedWmsUrl"
    class="h-full w-full object-contain"
    alt="Raster map returned by the submitted WMS GetMap URL"
    @load="handleWmsImageLoad"
    @error="handleWmsImageError"
  />
  <div
    v-if="wmsError"
    class="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-lg border border-red-300 bg-white/95 px-4 py-3 text-center text-[0.88rem] font-semibold text-red-700 shadow"
    role="alert"
  >
    {{ wmsError }}
  </div>
</div>

<div class="mt-1 text-center text-[0.66rem] leading-tight text-gray-500">
© OpenStreetMap contributors · WMS provided by terrestris
</div>

<!--
Edit only the BBOX values first. The URL remains an ordinary image source: the browser requests the WMS response when Load map is selected or Enter is pressed.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Land Use / Land Cover (LULC) Databases

<div class="grid grid-cols-[5fr_6fr] gap-5 mt-1 items-start">

<div>

<div class="text-[0.82rem] text-gray-700 mb-2"><strong>Land use</strong> describes human activity (agriculture, urban, forestry). <strong>Land cover</strong> describes the physical surface (vegetation, bare soil, water).</div>

<div class="grid grid-cols-1 gap-1.5 text-[0.78rem]">
  <div class="p-2 rounded-lg bg-teal-50 border border-teal-200">
    <div class="flex justify-between items-baseline"><div class="font-semibold text-teal-800">ESA WorldCover</div><div class="text-gray-400">2020–2021</div></div>
    <div class="text-gray-600">10 m global · 11 classes · Sentinel-1 &amp; -2</div>
  </div>
  <div class="p-2 rounded-lg bg-teal-50 border border-teal-200">
    <div class="flex justify-between items-baseline"><div class="font-semibold text-teal-800">CORINE Land Cover (CLC)</div><div class="text-gray-400">EU, since 1990</div></div>
    <div class="text-gray-600">100 m · 44 classes · updated every 6 years</div>
  </div>
  <div class="p-2 rounded-lg bg-teal-50 border border-teal-200">
    <div class="flex justify-between items-baseline"><div class="font-semibold text-teal-800">GlobeLand30</div><div class="text-gray-400">Global</div></div>
    <div class="text-gray-600">30 m · 10 classes · 2000 / 2010 / 2020 epochs</div>
  </div>
  <div class="p-2 rounded-lg bg-teal-50 border border-teal-200">
    <div class="flex justify-between items-baseline"><div class="font-semibold text-teal-800">Dynamic World (Google)</div><div class="text-gray-400">Near-real-time</div></div>
    <div class="text-gray-600">10 m · 9 classes · probabilistic per-scene output</div>
  </div>
</div>

</div>

<div class="flex flex-col gap-2">

  <div class="flex flex-col items-center">
    <img src="./figures/lulc-global.jpg" class="w-full rounded-lg object-cover" style="max-height:165px;" alt="ESA 2015 global land cover map"/>
    <div class="text-[0.63rem] text-gray-400 italic mt-0.5">Global land cover map 2015 · © ESA / ESA Climate Change Initiative</div>
  </div>

  <div class="flex flex-col items-center">
    <img src="./figures/lulc-amsterdam.png" class="w-full rounded-lg object-cover" style="max-height:155px;" alt="ESA WorldCover 10m map Amsterdam area"/>
    <div class="text-[0.63rem] text-gray-400 italic mt-0.5">ESA WorldCover 10 m — Amsterdam · © Copernicus / ESA</div>
  </div>

</div>

</div>

<!--
LULC datasets are among the most widely used geospatial data sources for environmental science and remote sensing. They combine satellite imagery with ground truth labels to produce thematic maps at regional to global scale. The distinction between land use and land cover matters: two fields with the same surface cover (bare soil) can have different uses (fallow vs. construction). The two images illustrate scale: the top shows a global-scale product from ESA's Climate Change Initiative, the bottom shows the 10 m WorldCover product zoomed into Amsterdam — notice how fine-grained urban, water, and vegetation classes become visible at local scale.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Administrative Boundaries

<div class="grid grid-cols-2 gap-8 mt-1 items-start">

<div class="flex flex-col items-center">
  <div class="font-bold text-indigo-800 text-[1.05rem] mb-1.5">GADM — Global Administrative Areas</div>
  <img src="./figures/gadm-germany.png" class="h-[240px] object-contain rounded-lg" alt="GADM administrative divisions of Germany"/>
  <div class="mt-1 text-[0.68rem] text-gray-400 text-center">Germany · 6 nesting levels · global coverage</div>
  <div class="mt-1.5 text-[0.8rem] text-gray-700 text-center px-2">Freely available polygons for every country; widely used in ecological &amp; socioeconomic modelling.</div>
  <div class="mt-1 text-[0.63rem] text-gray-400 text-center italic">Gringer / Wikipedia · CC BY-SA</div>
</div>

<div class="flex flex-col items-center">
  <div class="font-bold text-indigo-800 text-[1.05rem] mb-1.5">NUTS — EU Territorial Statistics Units</div>
  <img src="./figures/nuts-levels.png" class="h-[240px] object-contain rounded-lg" alt="NUTS-1, NUTS-2 and NUTS-3 hierarchical regions"/>
  <div class="mt-1 text-[0.68rem] text-gray-400 text-center">NUTS-1 → NUTS-2 → NUTS-3 · three nesting levels</div>
  <div class="mt-1.5 text-[0.8rem] text-gray-700 text-center px-2">EU standard: NUTS-1 (federal states), NUTS-2 (Regierungsbezirke), NUTS-3 (districts). Reference frame for Eurostat statistics.</div>
  <div class="mt-1 text-[0.63rem] text-gray-400 text-center italic">© Eurostat · ec.europa.eu/eurostat</div>
</div>

</div>

<!--
Administrative boundaries connect geographic data to the socioeconomic and political context used for statistics and policy. GADM covers the entire globe and is the default choice for global modelling studies. NUTS is EU-specific but provides strict hierarchical nesting that makes multi-scale analysis consistent. Note that boundaries change over time — NUTS was revised in 2016 and 2021, so always verify the vintage of your boundary file when doing time-series analysis.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Takeaways

## Geo-information Science

<div class="grid grid-cols-2 gap-8 mt-2">

<div>

<img
  src="./figures/gis.jpg"
  class="w-full h-[210px] object-contain rounded-xl"
  alt="GIS layer diagram"
/>

<div class="mt-3 text-[1.02rem] leading-snug text-center text-gray-700">
Real world → thematic layers → analysis
</div>

<div class="mt-3 text-center">
<strong class="text-blue-800">Examples:</strong> OSM, CORINE, GADM, cadastres
</div>

</div>

<div class="mt-1 text-left text-[1.0rem] leading-[1.2] text-gray-700">

<ul class="mt-2 space-y-1.5 text-left">
  <li>GIS organises the world as <strong>thematic layers</strong> aligned to a shared coordinate reference system.</li>
  <li>Vector data combines <strong>geometry</strong> (points, lines, polygons) with an <strong>attribute table</strong> — enabling spatial and semantic queries.</li>
  <li>OpenStreetMap is the world's largest <strong>open vector database</strong>: roads, buildings, land use, and POIs contributed by millions.</li>
  <li>LULC databases (<strong>ESA WorldCover, CORINE</strong>) map land cover classes globally using satellite imagery — raster products with thematic labels.</li>
  <li>Administrative boundaries (<strong>GADM, NUTS</strong>) are the standard aggregation frame for statistics, policy, and spatial cross-validation.</li>
  <li><strong>Spatial joins</strong> link vector layers: assign points to regions, aggregate raster values within polygons.</li>
</ul>

</div>

</div>

<!--
GIS data is the primary source for human-shaped geography: maps, boundaries, infrastructure, and land use. Unlike remote sensing, which derives data from sensor measurements, GIS data is often directly digitised, crowd-sourced, or statistically derived. For GRL: OSM and LULC products provide rich training labels; administrative boundaries define spatial evaluation regions.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# A Grid Turns Space into Values

<div class="grid grid-cols-[1fr_auto_1fr] gap-7 mt-12 items-center text-center">
  <div class="p-7 rounded-xl border box-card box-1"><h3>Location</h3><div class="mt-3 text-gray-700">row · column · cell</div></div>
  <div class="text-3xl text-blue-800">→</div>
  <div class="p-7 rounded-xl border box-card box-2"><h3>Measurement</h3><div class="mt-3 text-gray-700">one or many values</div></div>
</div>

<blockquote class="mt-10">
The grid defines where measurements are stored—and what spatial detail can be represented.
</blockquote>

<!--
Prepare the core raster concepts of cells, values, extent, and resolution. Detailed definitions and examples will be added later.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Spatial Resolution Changes What We See

<div class="grid grid-cols-3 gap-6 mt-9 items-end text-center">
  <div><div class="grid grid-cols-3 gap-1 w-28 h-28 mx-auto"><div v-for="n in 9" class="bg-blue-200 border border-white"></div></div><h3 class="mt-4">Coarse</h3></div>
  <div><div class="grid grid-cols-5 gap-1 w-28 h-28 mx-auto"><div v-for="n in 25" class="bg-blue-400 border border-white"></div></div><h3 class="mt-4">Medium</h3></div>
  <div><div class="grid grid-cols-8 gap-[2px] w-28 h-28 mx-auto"><div v-for="n in 64" class="bg-blue-700 border border-white"></div></div><h3 class="mt-4">Fine</h3></div>
</div>

<!--
Reserve space to develop spatial resolution and scale. Later examples should show that resolution changes both visible detail and suitable tasks.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Optical Imagery — Seeing Earth's Surface

<div class="mt-8 text-xl text-gray-800">
Aerial and satellite views across scales and wavelengths
</div>

<!--
Introduce optical imagery as one important family of raster observations. Later slides can distinguish platforms, spatial resolution, and spectral information.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# More Than a Color Photograph

<div class="grid grid-cols-3 gap-6 mt-10">
  <div class="p-6 rounded-xl border box-card box-1 text-center"><h3>Platform</h3><div class="mt-3 text-gray-700">airborne ↔ spaceborne</div></div>
  <div class="p-6 rounded-xl border box-card box-2 text-center"><h3>Scale</h3><div class="mt-3 text-gray-700">local ↔ global</div></div>
  <div class="p-6 rounded-xl border box-card box-3 text-center"><h3>Spectrum</h3><div class="mt-3 text-gray-700">visible ↔ beyond visible</div></div>
</div>

<!--
Mark the three dimensions along which the optical-imagery material can later expand. Keep the emphasis on imagery as measurements rather than ordinary photographs.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Satellite Time Series — Watching Earth Change

<div class="mt-8 text-xl text-gray-700">
The same place, observed again and again
</div>

<!--
Move from individual images to repeated observations. This section will later develop cadence, seasonality, change, and missing acquisitions.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# A Stack of Images Becomes a Time Series

<div class="flex items-center justify-center gap-5 mt-12">
  <div class="w-36 h-28 rounded-xl bg-blue-200 border-2 border-white shadow-md flex items-center justify-center text-blue-900 font-bold">t₁</div>
  <div class="text-2xl text-blue-800">→</div>
  <div class="w-36 h-28 rounded-xl bg-blue-400 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">t₂</div>
  <div class="text-2xl text-blue-800">→</div>
  <div class="w-36 h-28 rounded-xl bg-blue-700 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">t₃</div>
</div>

<blockquote class="mt-10">
Time reveals processes that a single snapshot cannot.
</blockquote>

<!--
Reserve a bridge from spatial imagery to temporal signals. Later content can compare image stacks, per-pixel series, and derived change products.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Radar — Measuring Earth Differently

<div class="mt-8 text-xl text-gray-700">
Active sensing with a different view of the surface
</div>

<!--
Introduce radar and SAR as a distinct Earth-observation modality. Later material should contrast what radar measures with optical reflectance.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Different Sensors Reveal Different Properties

<div class="grid grid-cols-2 gap-8 mt-10">
  <div class="p-7 rounded-xl border box-card box-1"><h3>Optical</h3><div class="mt-4 text-gray-700">Energy reflected or emitted by the surface</div></div>
  <div class="p-7 rounded-xl border box-card box-2"><h3>Radar</h3><div class="mt-4 text-gray-700">A transmitted signal and its return</div></div>
</div>

<!--
Create a placeholder for the conceptual optical–radar comparison. Acquisition geometry, wavelength, and interpretation belong in later detailed slides.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Point Observations — Sampling Earth

<div class="mt-8 text-xl text-gray-700">
Measurements at irregular locations and footprints
</div>

<!--
Shift from regular grids to irregularly located samples. Leave room for both in-situ sensors and satellite-derived footprints.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Samples Are Not the Whole Field

<div class="grid grid-cols-2 gap-8 mt-10">
  <div class="p-7 rounded-xl border box-card box-1"><h3>Where was Earth sampled?</h3><div class="mt-4 text-gray-700">Locations, paths, and footprints</div></div>
  <div class="p-7 rounded-xl border box-card box-2"><h3>What lies between samples?</h3><div class="mt-4 text-gray-700">Coverage, gaps, and inference</div></div>
</div>

<!--
Introduce sampling geometry and incomplete coverage as defining properties of point observations. Detailed treatment of interpolation and sampling bias is intentionally deferred.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# 3D Data — Point Clouds and Elevation

<div class="mt-8 text-xl text-gray-700">
Height, depth, and the structure above the surface
</div>

<!--
Extend geospatial observations into the vertical dimension. Later examples can distinguish elevation surfaces, point clouds, and volumetric measurements.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# The Vertical Dimension Has Many Representations

<div class="grid grid-cols-3 gap-6 mt-10">
  <div class="p-6 rounded-xl border box-card box-1 text-center"><h3>Surface</h3><div class="mt-3 text-gray-700">elevation</div></div>
  <div class="p-6 rounded-xl border box-card box-2 text-center"><h3>Points</h3><div class="mt-3 text-gray-700">3D structure</div></div>
  <div class="p-6 rounded-xl border box-card box-3 text-center"><h3>Volume</h3><div class="mt-3 text-gray-700">layers and depth</div></div>
</div>

<!--
Provide a placeholder taxonomy for vertical data. The later teaching pass can add terrain, LiDAR, bathymetry, and atmospheric or ocean profiles.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Lines and Networks — Representing Connections

<div class="mt-8 text-xl text-gray-800">
Paths, flows, and connected systems
</div>

<!--
Introduce linear geometries and the additional relationships encoded by networks. Concrete examples such as roads, rivers, and trajectories will be developed later.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Geometry and Connectivity Tell Different Stories

<div class="grid grid-cols-2 gap-8 mt-10">
  <div class="p-7 rounded-xl border box-card box-1"><h3>Line geometry</h3><div class="mt-4 text-gray-700">Where does it go?</div></div>
  <div class="p-7 rounded-xl border box-card box-2"><h3>Network structure</h3><div class="mt-4 text-gray-700">What connects to what?</div></div>
</div>

<!--
Reserve the distinction between the shape of a line and the topology of a network. This later supports graph-based geospatial representations.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Polygons and Regions — Representing Objects

<div class="mt-8 text-xl text-gray-700">
Boundaries turn space into discrete regions
</div>

<!--
Introduce polygons as bounded spatial objects or areas. Later examples can cover parcels, buildings, administrative units, and land-use regions.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Boundaries Depend on Purpose

<div class="grid grid-cols-2 gap-8 mt-10">
  <div class="p-7 rounded-xl border box-card box-1"><h3>Physical boundaries</h3><div class="mt-4 text-gray-700">Observed or delineated</div></div>
  <div class="p-7 rounded-xl border box-card box-2"><h3>Conceptual boundaries</h3><div class="mt-4 text-gray-700">Defined for a task or institution</div></div>
</div>

<!--
Flag that regions are not always inherent objects in the world. Later content can develop boundary uncertainty, scale, and aggregation.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Models and Reanalysis — Filling the Gaps

<div class="mt-8 text-xl text-gray-700">
Spatial fields generated, estimated, or simulated by models
</div>

<!--
Introduce model outputs and reanalysis as a different route to spatial fields. Prepare the distinction between direct observations and model-informed estimates.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# Observation and Model Are Not Opposites

<div class="flex items-center justify-center gap-6 mt-12">
  <div class="p-6 w-52 rounded-xl border box-card box-1 text-center"><h3>Observations</h3></div>
  <div class="text-3xl text-blue-800">+</div>
  <div class="p-6 w-52 rounded-xl border box-card box-2 text-center"><h3>Models</h3></div>
  <div class="text-3xl text-blue-800">→</div>
  <div class="p-6 w-52 rounded-xl border box-card box-3 text-center"><h3>Spatial fields</h3></div>
</div>

<blockquote class="mt-10">
Model-based products combine assumptions, dynamics, and measurements.
</blockquote>

<!--
Create a placeholder for data assimilation, modeled fields, and reanalysis products such as ERA5. Detailed workflows and uncertainty belong in the later content pass.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# One Location, Many Measurements

<div class="mt-8 text-xl text-gray-700">
There is no single representation of a place
</div>

<!--
Synthesize the block around the central idea that one location supports many representations. This sets up the learning problem created by heterogeneous geospatial data.
-->

---
section: geo-information-science
sectionTitle: Geo-information Science
---

# One Place, Many Views

<div class="grid grid-cols-4 gap-4 mt-7 text-center">
  <div class="p-4 rounded-xl border box-card box-1"><h3>Imagery</h3></div>
  <div class="p-4 rounded-xl border box-card box-2"><h3>Time series</h3></div>
  <div class="p-4 rounded-xl border box-card box-3"><h3>Radar</h3></div>
  <div class="p-4 rounded-xl border box-card box-1"><h3>Elevation</h3></div>
  <div class="p-4 rounded-xl border box-card box-2"><h3>Weather</h3></div>
  <div class="p-4 rounded-xl border box-card box-3"><h3>Regions</h3></div>
  <div class="p-4 rounded-xl border box-card box-1"><h3>Networks</h3></div>
  <div class="p-4 rounded-xl border box-card box-2"><h3>Model fields</h3></div>
</div>

<blockquote class="mt-8">
How can we represent—and learn from—all of these views together?
</blockquote>

<!--
Close Block 2 by gathering its modalities around one place. Use the final question to motivate the rest of the geospatial representation learning course.
-->
