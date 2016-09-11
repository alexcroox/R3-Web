/*
leaflet-boundsawarelayergroup - 1.2.1, Leaflet.LayerGroup plugin to render only layers in the current map bounds
git://github.com/brandoncopeland/Leaflet.boundsAwareLayerGroup.git
(c) 2013 Brandon Copeland <br@ndoncopeland.com>

leaflet-boundsawarelayergroup assumes Leaflet has already been included
*/
!function(a){var b={makeBoundsAware:!1},c=a.LayerGroup.prototype.initialize,d=a.LayerGroup.prototype.onRemove;a.LayerGroup.include({initialize:function(d,e){a.setOptions(this,b),a.setOptions(this,e),c.call(this,d)},addLayer:function(a){var b=this.getLayerId(a);return this._layers[b]=a,this._map&&(this.options&&this.options.makeBoundsAware===!0?this._addForBounds({0:a},this._map):this._map.addLayer(a)),this},onAdd:function(a){this._map=a,this.options&&this.options.makeBoundsAware===!0?(this._addForBounds(this._layers,a),a.on("moveend",this._onMapMoveEnd,this)):this.eachLayer(a.addLayer,a)},onRemove:function(a){d.call(this,a),a.off("moveend",this._onMapMoveEnd,this)},_onMapMoveEnd:function(){this._addForBounds(this._layers,this._map)},_addForBounds:function(a,b){var c,d,e,f=b.getBounds();for(e in a)d=a[e],c=!0,"function"==typeof d.getLatLng?f.contains(d.getLatLng())||(c=!1):"function"==typeof d.getBounds&&(f.intersects(d.getBounds())||(c=!1)),this.options.minZoom&&b.getZoom()<this.options.minZoom&&(c=!1),this.options.maxZoom&&b.getZoom()>this.options.maxZoom&&(c=!1),c?b.addLayer(d):b.removeLayer(d)}}),a.layerGroup=function(b,c){return new a.LayerGroup(b,c)},a.featureGroup=function(b,c){return new a.FeatureGroup(b,c)}}(L);
