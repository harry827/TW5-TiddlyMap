/*\

title: $:/plugins/felixhayashi/tiddlymap/widget/map.js
type: application/javascript
module-type: widget

@module TiddlyMap
@preserve

\*/
(function(){"use strict";var e=require("$:/core/modules/widgets/widget.js").widget;var t=require("$:/plugins/felixhayashi/tiddlymap/view_abstraction.js").ViewAbstraction;var i=require("$:/plugins/felixhayashi/tiddlymap/callback_manager.js").CallbackManager;var s=require("$:/plugins/felixhayashi/tiddlymap/dialog_manager.js").DialogManager;var r=require("$:/plugins/felixhayashi/tiddlymap/utils.js").utils;var a=require("$:/plugins/felixhayashi/tiddlymap/edgetype.js").EdgeType;var n=require("$:/plugins/felixhayashi/vis/vis.js");var o=function(t,a){e.call(this);this.initialise(t,a);this.adapter=$tw.tmap.adapter;this.opt=$tw.tmap.opt;this.notify=$tw.tmap.notify;this.callbackManager=new i;this.dialogManager=new s(this.callbackManager,this);this.computeAttributes();this.objectId=this.getAttribute("object-id")?this.getAttribute("object-id"):r.genUUID();this.editorMode=this.getAttribute("editor");if(this.editorMode){r.addListeners({"tmap:tm-create-view":this.handleCreateView,"tmap:tm-rename-view":this.handleRenameView,"tmap:tm-delete-view":this.handleDeleteView,"tmap:tm-edit-view":this.handleEditView,"tmap:tm-configure-system":this.handleConfigureSystem,"tmap:tm-store-position":this.handleStorePositions,"tmap:tm-edit-filters":this.handleEditFilters,"tmap:tm-generate-widget":this.handleGenerateWidget},this,this)}r.addListeners({"tmap:tm-focus-node":this.handleFocusNode,"tmap:tm-reset-focus":this.repaintGraph},this,this)};o.prototype=Object.create(e.prototype);o.prototype.handleConnectionEvent=function(e,t){var i={fromLabel:this.adapter.selectNodeById(e.from).label,toLabel:this.adapter.selectNodeById(e.to).label};this.dialogManager.open("getEdgeType",i,function(i,s){if(i){var n=r.getText(s);var o=r.hasSubString(n,":");var d=this.view.getConfig("edge_type_namespace");n=new a((d&&!o?d:"")+n);if(!n.exists())n.persist();e.type=n.getId();var h=this.adapter.insertEdge(e);var l=this.view.getEdgeFilter("compiled");var g=this.adapter.getEdgeTypeWhiteList(l);if(!g[n.getId()]){var p={type:n.getId(),view:this.view.getLabel()};$tw.tmap.dialogManager.open("edgeNotVisible",p)}}if(typeof t=="function"){t(i)}})};o.prototype.checkForFreshInstall=function(){if(r.getEntry(this.opt.ref.sysMeta,"showWelcomeMessage",true)){r.setEntry(this.opt.ref.sysMeta,"showWelcomeMessage",false);this.dialogManager.open("welcome")}};o.prototype.openStandardConfirmDialog=function(e,t){var i={message:t};this.dialogManager.open("getConfirmation",i,e)};o.prototype.logger=function(e,t){var i=Array.prototype.slice.call(arguments,1);i.unshift("@"+this.objectId.toUpperCase());i.unshift(e);$tw.tmap.logger.apply(this,i)};o.prototype.render=function(e,t){this.parentDomNode=e;if(r.isPreviewed(this)){this.initAndRenderPlaceholder(e);return}this.registerClassNames(e);this.sidebar=r.getFirstElementByClassName("tc-sidebar-scrollable");this.isContainedInSidebar=this.sidebar&&this.sidebar.contains(this.parentDomNode);this.viewHolderRef=this.getViewHolderRef();this.view=this.getView();this.initAndRenderEditorBar(e);if(!r.isPreviewed(this)){this.initAndRenderGraph(e)}$tw.tmap.registry.push(this);this.checkOnRefreshTriggers();this.checkForFreshInstall()};o.prototype.registerClassNames=function(e){if(!$tw.utils.hasClass(e,"tmap-widget")){var t=["tmap-widget"];if(this.isClickToUse()){t.push("tmap-click-to-use")}if(this.getAttribute("editor")==="advanced"){t.push("tmap-advanced-editor")}if(!r.isTrue(this.getAttribute("show-buttons"),true)){t.push("tmap-no-buttons")}if(this.getAttribute("class")){t.push(this.getAttribute("class"))}$tw.utils.addClass(e,t.join(" "));this.graphLoadingBarDomNode=document.createElement("div");$tw.utils.addClass(this.graphLoadingBarDomNode,"tmap-loading-bar");e.appendChild(this.graphLoadingBarDomNode)}};o.prototype.initAndRenderEditorBar=function(e){this.graphBarDomNode=document.createElement("div");$tw.utils.addClass(this.graphBarDomNode,"tmap-topbar");e.appendChild(this.graphBarDomNode);this.rebuildEditorBar();this.renderChildren(this.graphBarDomNode)};o.prototype.initAndRenderPlaceholder=function(e){$tw.utils.addClass(e,"tmap-graph-placeholder")};o.prototype.rebuildEditorBar=function(){var e=r.flatten({param:{viewLabel:this.view.getLabel(),isViewBound:String(this.isViewBound()),ref:{view:this.view.getRoot(),viewHolder:this.getViewHolderRef(),edgeFilter:this.view.getPaths().edgeFilter},allEdgesFilter:this.opt.selector.allEdgeTypes,searchOutput:"$:/temp/tmap/bar/search",nodeFilter:"[list[$:/temp/tmap/nodes/"+this.view.getLabel()+"]"+"search:title{$:/temp/tmap/bar/search}]"}});for(var t in e){this.setVariable(t,e[t])}var i={type:"tiddler",attributes:{tiddler:{type:"string",value:this.view.getRoot()}},children:[]};if(this.editorMode==="advanced"){i.children.push({type:"transclude",attributes:{tiddler:{type:"string",value:this.opt.ref.graphBar}}})}else{i.children.push({type:"element",tag:"span",attributes:{"class":{type:"string",value:"tmap-view-label"}},children:[{type:"text",text:e["param.viewLabel"]}]})}i.children.push({type:"transclude",attributes:{tiddler:{type:"string",value:this.opt.ref.focusButton}}});this.makeChildWidgets([i])};o.prototype.refresh=function(e){if(this.isZombieWidget()||!this.network||r.isPreviewed(this))return;this.callbackManager.handleChanges(e);var t=this.isViewSwitched(e);var i=this.view.refresh(e);if(t||i.length){var s={resetData:true,resetOptions:true,resetFocus:{delay:0,duration:0}};if(t){this.logger("warn","View switched");this.view=this.getView(true)}else{this.logger("warn","View modified",i);s.resetData=false}this.rebuildGraph(s);this.checkOnRefreshTriggers()}else{this.checkOnGraph(e)}this.checkOnEditorBar(e,t,i)};o.prototype.checkOnRefreshTriggers=function(){this.callbackManager.remove(this.refreshTriggers);var e=this.getAttribute("refresh-triggers")||this.view.getConfig("refresh-triggers");this.refreshTriggers=$tw.utils.parseStringArray(e)||[];this.logger("debug","Registering refresh trigger",this.refreshTriggers);for(var t=0;t<this.refreshTriggers.length;t++){this.callbackManager.add(this.refreshTriggers[t],this.handleTriggeredRefresh.bind(this),false)}};o.prototype.rebuildGraph=function(e){if(r.isPreviewed(this))return;this.logger("debug","Rebuilding graph");e=e||{};this.hasNetworkStabilized=false;this.network.selectNodes([]);if(e.resetData){this.graphData.edges.clear();this.graphData.nodes.clear();this.graphData.edgesById=null;this.graphData.nodesById=null}if(e.resetOptions){this.graphOptions=this.getGraphOptions();this.network.setOptions(this.graphOptions)}this.rebuildGraphData(true);if(!r.hasElements(this.graphData.nodesById)){return}this.network.stabilize();if(e.resetFocus&&!this.preventNextContextReset){this.fitGraph(e.resetFocus.delay,e.resetFocus.duration)}this.doZoomAfterStabilize=true;this.preventNextContextReset=false};o.prototype.getContainer=function(){return this.parentDomNode};o.prototype.rebuildGraphData=function(e){$tw.tmap.start("Reloading Network");if(!e&&this.graphData){return this.graphData}var t=this.adapter.getGraph({view:this.view});var i=t.nodes;var s=t.edges;this.graphData.nodes=this.getRefreshedDataSet(i,this.graphData.nodesById,this.graphData.nodes);this.graphData.edges=this.getRefreshedDataSet(s,this.graphData.edgesById,this.graphData.edges);this.graphData.nodesById=i;this.graphData.edgesById=s;r.setField("$:/temp/tmap/nodes/"+this.view.getLabel(),"list",this.adapter.getTiddlersById(i));$tw.tmap.stop("Reloading Network");return this.graphData};o.prototype.isViewBound=function(){return r.startsWith(this.getViewHolderRef(),this.opt.path.localHolders)};o.prototype.isViewSwitched=function(e){if(this.isViewBound()){return false}else{return r.hasOwnProp(e,this.getViewHolderRef())}};o.prototype.checkOnEditorBar=function(e,t,i){if(t||i.length){this.removeChildDomNodes();this.rebuildEditorBar();this.renderChildren(this.graphBarDomNode);return true}else{return this.refreshChildren(e)}};o.prototype.checkOnGraph=function(e){var t=this.view.getNodeFilter("compiled");var i=r.getMatches(t,Object.keys(e),true);for(var s in e){if(r.isSystemOrDraft(s))continue;var a=i[s];var n=this.graphData.nodesById[this.adapter.getId(s)];if(a||n){this.rebuildGraph();return}}var o=this.view.getEdgeFilter("compiled");var d=r.getMatches(o,Object.keys(e));if(d.length){this.logger("info","Changed edge-types",d);this.rebuildGraph();return}};o.prototype.initAndRenderGraph=function(e){this.logger("info","Initializing and rendering the graph");this.graphDomNode=document.createElement("div");e.appendChild(this.graphDomNode);$tw.utils.addClass(this.graphDomNode,"tmap-vis-graph");e.style["width"]=this.getAttribute("width","100%");this.handleResizeEvent=this.handleResizeEvent.bind(this);this.handleClickEvent=this.handleClickEvent.bind(this);window.addEventListener("resize",this.handleResizeEvent,false);if(!this.isContainedInSidebar){this.callbackManager.add("$:/state/sidebar",this.handleResizeEvent)}window.addEventListener("click",this.handleClickEvent,false);var t=r.getFullScreenApis();if(t){window.addEventListener(t["_fullscreenChange"],this.handleFullScreenChange.bind(this),false)}this.handleResizeEvent();this.graphOptions=this.getGraphOptions();this.graphData={nodes:new n.DataSet,edges:new n.DataSet,nodesById:r.getDataMap(),edgesById:r.getDataMap()};this.network=new n.Network(this.graphDomNode,this.graphData,this.graphOptions);this.visNetworkDomNode=this.graphDomNode.firstElementChild;this.addKeyBindings();this.network.on("click",this.handleVisSingleClickEvent.bind(this));this.network.on("doubleClick",this.handleVisDoubleClickEvent.bind(this));this.network.on("stabilized",this.handleVisStabilizedEvent.bind(this));this.network.on("dragStart",this.handleVisDragStart.bind(this));this.network.on("dragEnd",this.handleVisDragEnd.bind(this));this.network.on("select",this.handleVisSelect.bind(this));this.network.on("viewChanged",this.handleVisViewportChanged.bind(this));this.network.on("beforeDrawing",this.handleVisBeforeDrawing.bind(this));this.network.on("stabilizationProgress",this.handleVisLoading.bind(this));this.network.on("stabilizationIterationsDone",this.handleVisLoadingDone.bind(this));this.addGraphButtons({"fullscreen-button":function(){this.handleToggleFullscreen(false)}});if(this.isContainedInSidebar){this.addGraphButtons({"halfscreen-button":function(){this.handleToggleFullscreen(true)}})}this.rebuildGraph({resetFocus:{delay:0,duration:0}})};o.prototype.addKeyBindings=function(e){this.visNetworkDomNode.tabIndex=0;var t=n.keycharm({container:this.parentDomNode});t.bind("delete",function(){this.handleRemoveElement(this.network.getSelection())}.bind(this))};o.prototype.isClickToUse=function(){return r.isTrue(this.getAttribute("click-to-use"),true)||this.isMobileMode()&&this.objectId==="main_editor"};o.prototype.isMobileMode=function(){var e=r.getText(this.opt.ref.sidebarBreakpoint,960);return window.innerWidth<=parseInt(e)};o.prototype.getGraphOptions=function(){var e=this.view.getVisConfig();e.clickToUse=this.isClickToUse();e.manipulation={enabled:this.editorMode?true:false,initiallyActive:true,controlNodeStyle:{}};e.manipulation.deleteNode=function(e,t){this.handleRemoveElement(e);this.resetVisManipulationBar(t)}.bind(this);e.manipulation.deleteEdge=e.manipulation.deleteNode;e.manipulation.addEdge=function(e,t){this.handleConnectionEvent(e);this.resetVisManipulationBar(t)}.bind(this);e.manipulation.addNode=function(e,t){this.handleInsertNode(e);this.resetVisManipulationBar(t)}.bind(this);e.manipulation.editEdge=function(e,t){var i=this.handleReconnectEdge(e);this.resetVisManipulationBar(t)}.bind(this);r.merge(e,{physics:{forceAtlas2Based:{centralGravity:this.view.isEnabled("physics_mode")?.001:0},stabilization:{iterations:this.view.getStabilizationIterations()}}});this.logger("debug","Loaded graph options",e);return e};o.prototype.resetVisManipulationBar=function(e){if(e)e(null);this.network.disableEditMode();this.network.enableEditMode()};o.prototype.handleCreateView=function(){this.dialogManager.open("createView",null,function(e,i){if(e){var s=r.getText(i);var a=new t(s);if(a.isLocked()){this.notify("Forbidden!")}else{var a=this.adapter.createView(s);this.setView(a.getRoot())}}})};o.prototype.handleRenameView=function(){if(!this.view.isLocked()){var e=this.view.getReferences();var i={count:e.length.toString(),filter:r.joinAndWrap(e,"[[","]]")};this.dialogManager.open("getViewName",i,function(e,i){if(e){var s=r.getText(i);var a=new t(s);if(a.isLocked()){this.notify("Forbidden!")}else{this.view.rename(s);this.setView(this.view.getRoot())}}})}else{this.notify("Forbidden!")}};o.prototype.handleEditView=function(){var e={view:this.view.getLabel(),createdOn:this.view.getCreationDate(true),numberOfNodes:""+Object.keys(this.graphData.nodesById).length,numberOfEdges:""+Object.keys(this.graphData.edgesById).length,dialog:{preselects:this.view.getConfig()}};this.dialogManager.open("configureView",e,function(e,t){if(e&&t){var i=r.getPropertiesByPrefix(t.fields,"config.");this.view.setConfig(i)}})};o.prototype.handleDeleteView=function(){var e=this.view.getLabel();if(this.view.isLocked()){this.notify("Forbidden!");return}var t=this.view.getReferences();if(t.length){var i={count:t.length.toString(),filter:r.joinAndWrap(t,"[[","]]")};this.dialogManager.open("cannotDeleteViewDialog",i);return}var s="You are about to delete the view "+"''"+e+"'' (no tiddler currently references this view).";this.openStandardConfirmDialog(function(t){if(t){this.view.destroy();this.setView(this.opt.path.views+"/default");this.notify('view "'+e+'" deleted ')}},s)};o.prototype.handleTriggeredRefresh=function(e){var t=r.getMatches(this.view.getNodeFilter("compiled"));var i=$tw.utils.hashString(t.join());if(i!=this.triggerState){this.logger("log",e,"Triggered a refresh");this.triggerState=i;this.rebuildGraph({resetData:false,resetOptions:false,resetFocus:{delay:1e3,duration:1e3}})}};o.prototype.handleConfigureSystem=function(){var e={dialog:{preselects:r.flatten({config:{sys:this.opt.config.sys}})}};this.dialogManager.open("configureTiddlyMap",e,function(e,t){if(e&&t){var i=r.getPropertiesByPrefix(t.fields,"config.sys.",true);if(i["field.nodeId"]!==this.opt.field.nodeId&&isWelcomeDialog!==true){var s={name:"Node-id",oldValue:this.opt.field.nodeId,newValue:i["field.nodeId"]};this.dialogManager.open("fieldChanged",s,function(e,t){if(e){r.moveFieldValues(s.oldValue,s.newValue,true,false);this.notify("Transported field values")}})}this.wiki.setTiddlerData(this.opt.ref.sysConf+"/user",i)}})};o.prototype.handleReconnectEdge=function(e){var t=this.graphData.edges.get(e.id);this.adapter.deleteEdge(t);var i=$tw.utils.extend(t,e);return this.adapter.insertEdge(i)};o.prototype.handleRemoveElement=function(e){if(e.edges.length&&!e.nodes.length){this.handleRemoveEdges(e.edges)}if(e.nodes.length){this.handleRemoveNode(this.graphData.nodesById[e.nodes[0]])}this.resetVisManipulationBar()};o.prototype.handleRemoveEdges=function(e){this.adapter.deleteEdges(this.graphData.edges.get(e));this.notify("edge"+(e.length>1?"s":"")+" removed")};o.prototype.handleRemoveNode=function(e){var t={"var.nodeLabel":e.label,"var.nodeRef":$tw.tmap.indeces.tById[e.id],dialog:{preselects:{"opt.delete":"from"+" "+(this.view.isExplicitNode(e)?"filter":"system")}}};this.dialogManager.open("deleteNodeDialog",t,function(t,i){if(t){if(i.fields["opt.delete"]==="from system"){this.adapter.deleteNode(e)}else{var s=this.view.removeNodeFromFilter(e);if(!s){this.notify("Couldn't remove node from filter");return}}this.notify("Node removed "+i.fields["opt.delete"])}})};o.prototype.handleFullScreenChange=function(){var e=r.getFullScreenApis();if(e&&this.enlargedMode==="fullscreen"&&!document[e["_fullscreenElement"]]){this.handleToggleFullscreen()}};o.prototype.handleToggleFullscreen=function(e){var t=r.getFullScreenApis();this.logger("log","Toggled graph enlargement");if(this.enlargedMode){this.network.setOptions({clickToUse:this.isClickToUse()});r.findAndRemoveClassNames(["tmap-"+this.enlargedMode,"tmap-has-"+this.enlargedMode+"-child"]);if(this.enlargedMode==="fullscreen"){document[t["_exitFullscreen"]]()}this.enlargedMode=null}else{if(!e&&!t){this.dialogManager.open("fullscreenNotSupported");return}this.enlargedMode=this.isContainedInSidebar&&e?"halfscreen":"fullscreen";$tw.utils.addClass(this.parentDomNode,"tmap-"+this.enlargedMode);var i=this.isContainedInSidebar?this.sidebar:r.getFirstElementByClassName("tc-story-river");$tw.utils.addClass(i,"tmap-has-"+this.enlargedMode+"-child");if(this.enlargedMode==="fullscreen"){document.documentElement[t["_requestFullscreen"]](Element.ALLOW_KEYBOARD_INPUT)}this.notify("Activated "+this.enlargedMode+" mode");this.network.setOptions({clickToUse:false})}this.handleResizeEvent()};o.prototype.handleGenerateWidget=function(e){$tw.rootWidget.dispatchEvent({type:"tmap:tm-generate-widget",paramObject:{view:this.view.getLabel()}})};o.prototype.handleStorePositions=function(e){this.adapter.storePositions(this.network.getPositions(),this.view);if(e){this.notify("positions stored")}};o.prototype.handleEditFilters=function(){var e=r.getPrettyFilter(this.view.getNodeFilter("expression"));var t=r.getPrettyFilter(this.view.getEdgeFilter("expression"));var i={view:this.view.getLabel(),dialog:{preselects:{prettyNodeFilter:e,prettyEdgeFilter:t}}};this.dialogManager.open("editFilters",i,function(i,s){if(i){this.view.setNodeFilter(r.getField(s,"prettyNodeFilter",e));this.view.setEdgeFilter(r.getField(s,"prettyEdgeFilter",t))}})};o.prototype.handleVisStabilizedEvent=function(e){if(!this.hasNetworkStabilized){this.hasNetworkStabilized=true;this.logger("log","Network stabilized after "+e.iterations+" iterations");this.view.setStabilizationIterations(e.iterations);var t=this.view.isEnabled("physics_mode");this.network.storePositions();this.setNodesMoveable(this.graphData.nodesById,t);if(this.doZoomAfterStabilize){this.doZoomAfterStabilize=false;this.fitGraph(1e3,1e3)}}};o.prototype.handleFocusNode=function(e){this.network.focus(this.adapter.getId(e.param),{scale:1.5,animation:true})};o.prototype.isZombieWidget=function(){return!document.body.contains(this.getContainer())};o.prototype.fitGraph=function(e,t){this.logger("debug","Fit graph",this.activeFitTimeout);window.clearTimeout(this.activeFitTimeout);var i=function(){if(this.isZombieWidget())return;this.network.redraw();this.network.fit({animation:{duration:t||0,easingFunction:"easeOutQuart"}})};this.activeFitTimeout=window.setTimeout(i.bind(this),e||0)};o.prototype.handleInsertNode=function(e){this.dialogManager.open("getNodeTitle",null,function(t,i){if(t){var s=r.getText(i);if(r.tiddlerExists(s)){if(r.isMatch(s,this.view.getNodeFilter("compiled"))){this.notify("Node already exists")}else{e=this.adapter.makeNode(s,e,this.view);this.view.addNodeToView(e);this.rebuildGraph()}}else{e.label=s;this.adapter.insertNode(e,{view:this.view,editNodeOnCreate:false});this.preventNextContextReset=true}}})};o.prototype.handleVisSingleClickEvent=function(e){if(r.isTrue(this.opt.config.sys.singleClickMode)){this.handleVisClickEvent(e)}};o.prototype.handleVisDoubleClickEvent=function(e){if(!e.nodes.length&&!e.edges.length){if(this.editorMode){this.handleInsertNode(e.pointer.canvas)}}else if(!r.isTrue(this.opt.config.sys.singleClickMode)){this.handleVisClickEvent(e)}};o.prototype.handleVisClickEvent=function(e){if(e.nodes.length){this.openTiddlerWithId(e.nodes[0])}else if(e.edges.length){if(!this.editorMode)return;this.logger("debug","Clicked on an Edge");var t=this.opt.config.sys.edgeClickBehaviour;var i=new a(this.graphData.edgesById[e.edges[0]].type);if(t==="manager"){$tw.rootWidget.dispatchEvent({type:"tmap:tm-manage-edge-types",paramObject:{type:i.getId()}})}}};o.prototype.handleResizeEvent=function(e){if(this.isZombieWidget())return;if(this.isContainedInSidebar){var t=window.innerHeight;var i=this.parentDomNode.getBoundingClientRect().top;var s=this.getAttribute("bottom-spacing","25px");var r=t-i+"px";this.parentDomNode.style["height"]="calc("+r+" - "+s+")"}else{var a=this.getAttribute("height");this.parentDomNode.style["height"]=a?a:"300px"}if(this.network){this.repaintGraph()}};o.prototype.handleClickEvent=function(e){if(this.isZombieWidget()||!this.network)return;var t=document.elementFromPoint(e.clientX,e.clientY);if(!this.parentDomNode.contains(t)){var i=this.network.getSelection();if(i.nodes.length||i.edges.length){this.logger("debug","Clicked outside; deselecting nodes/edges");this.network.selectNodes([]);this.resetVisManipulationBar()}}else if(this.graphDomNode.contains(t)){this.visNetworkDomNode.focus()}};o.prototype.handleVisDragEnd=function(e){if(e.nodes.length){var t=this.graphData.nodesById[e.nodes[0]];if(!this.view.isEnabled("physics_mode")){this.setNodesMoveable([t],false);var i=parseInt(this.opt.config.sys.raster);if(i){var s=this.network.getPositions()[t.id];this.graphData.nodes.update({id:t.id,x:s.x-s.x%i,y:s.y-s.y%i})}this.handleStorePositions()}}};o.prototype.handleVisSelect=function(e){};o.prototype.handleVisViewportChanged=function(e){this.doZoomAfterStabilize=false};o.prototype.handleVisBeforeDrawing=function(e){};o.prototype.handleVisLoading=function(e){this.graphLoadingBarDomNode.style.display="block";var t="Loading "+e.iterations/e.total*100+"%";this.graphLoadingBarDomNode.innerHTML=t};o.prototype.handleVisLoadingDone=function(e){this.graphLoadingBarDomNode.style.display="none"};o.prototype.handleVisDragStart=function(e){if(e.nodes.length){var t=this.graphData.nodesById[e.nodes[0]];this.setNodesMoveable([t],true)}};o.prototype.destruct=function(){window.removeEventListener("resize",this.handleResizeEvent);window.removeEventListener("click",this.handleClickEvent);if(this.network){this.network.destroy()}};o.prototype.openTiddlerWithId=function(e){var t=$tw.tmap.indeces.tById[e];this.logger("debug","Opening tiddler",t,"with id",e);if(this.enlargedMode==="fullscreen"){this.dispatchEvent({type:"tm-edit-tiddler",tiddlerTitle:t});var i=this.wiki.findDraft(t);if(!i)return;var s={param:{ref:i}};this.dialogManager.open("fullscreenTiddlerEditor",s,function(e,t){if(e){this.dispatchEvent({type:"tm-save-tiddler",tiddlerTitle:i})}else{this.dispatchEvent({type:"tm-cancel-tiddler",tiddlerTitle:i})}})}else{this.dispatchEvent({type:"tm-navigate",navigateTo:t})}};o.prototype.getViewHolderRef=function(){if(this.viewHolderRef){return this.viewHolderRef}this.logger("info","Retrieving or generating the view holder reference");var e=this.getAttribute("view");if(e){this.logger("log",'User wants to bind view "'+e+'" to graph');var t=this.opt.path.views+"/"+e;if(this.wiki.getTiddler(t)){var i=this.opt.path.localHolders+"/"+r.genUUID();this.logger("log",'Created an independent temporary view holder "'+i+'"');this.wiki.addTiddler(new $tw.Tiddler({title:i,text:t}));this.logger("log",'View "'+t+'" inserted into independend holder')}else{this.logger("log",'View "'+e+'" does not exist')}}if(typeof i==="undefined"){this.logger("log","Using default (global) view holder");var i=this.opt.ref.defaultGraphViewHolder}return i};o.prototype.setView=function(e,t){if(e){if(!t){t=this.viewHolderRef}this.logger("info",'Inserting view "'+e+'" into holder "'+t+'"');this.wiki.addTiddler(new $tw.Tiddler({title:t,text:e}))}this.view=this.getView(true)};o.prototype.getView=function(e){if(!e&&this.view){return this.view}var i=this.getViewHolderRef();var s=new t(r.getText(i));this.logger("info",'Retrieved view "'+s.getLabel()+'" from holder "'+i+'"');if(s.exists()){return s}else{this.logger("log",'Warning: View "'+s.getLabel()+"\" doesn't exist. Default is used instead.");return new t("Default")}};o.prototype.getRefreshedDataSet=function(e,t,i){if(!i){return new n.DataSet(r.convert(e,"array"))}var s=[];for(var a in t){if(!e[a]){s.push(a)}}i.remove(s);var o=i.get({returnType:"Object"});var d=[];for(var a in e){var h=e[a];d.push(h)}i.update(d);return i};o.prototype.repaintGraph=function(){var e=r.getFullScreenApis();if(!e||!document[e["_fullscreenElement"]]||this.enlargedMode){this.logger("info","Repainting the whole graph");this.network.redraw();this.fitGraph(0,1e3)}};o.prototype.setGraphButtonEnabled=function(e,t){var i="vis-button"+" "+"tmap-"+e;var s=r.getFirstElementByClassName(i,this.parentDomNode);$tw.utils.toggleClass(s,"tmap-button-enabled",t)};o.prototype.setNodesMoveable=function(e,t){this.network.storePositions();var i=[];var s=Object.keys(e);for(var r=0;r<s.length;r++){var a=e[s[r]].id;var n={id:a,fixed:{x:!t,y:!t}};i.push(n)}this.graphData.nodes.update(i)};o.prototype.addGraphButtons=function(e){var t=r.getFirstElementByClassName("vis-navigation",this.parentDomNode);for(var i in e){var s=document.createElement("div");s.className="vis-button "+" "+"tmap-"+i;s.addEventListener("click",e[i].bind(this),false);t.appendChild(s);this.setGraphButtonEnabled(i,true)}};if($tw.boot.tasks.trapErrors){var d=window.onerror;window.onerror=function(e,t,i){if($tw.tmap.utils.hasSubString(e,"NS_ERROR_NOT_AVAILABLE")&&t=="$:/plugins/felixhayashi/vis/vis.js"){console.error("Strange firefox related vis.js error (see https://github.com/felixhayashi/TW5-TiddlyMap/issues/125)",arguments)}else if(d){d.apply(this,arguments)}}}exports.tiddlymap=o})();