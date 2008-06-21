/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Sage.
 *
 * The Initial Developer of the Original Code is
 * Peter Andrews <petea@jhu.edu>.
 * Portions created by the Initial Developer are Copyright (C) 2005
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * Peter Andrews <petea@jhu.edu>
 * Erik Arvidsson <erik@eae.net>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

const CLASS_ID     = Components.ID("{D6C44263-AC55-43E7-BC5A-82BBDBD7CD37}");
const CLASS_NAME   = "Sage Protocol Handler";
const CONTRACT_ID  = "@mozilla.org/network/protocol;1?name=sage";

function sageProtocolHandler() {}

sageProtocolHandler.prototype = {

  scheme : "sage",
  defaultPort : -1,
  protocolFlags : Components.interfaces.nsIProtocolHandler.URI_NORELATIVE | Components.interfaces.nsIProtocolHandler.URI_NOAUTH,
  
  allowPort : function(port, scheme) {
    return false;
  },
  
  newChannel : function(URI) {
    var url = Cc["@mozilla.org/network/standard-url;1"].createInstance(Ci.nsIStandardURL);
    url.init(Ci.nsIStandardURL.URLTYPE_STANDARD, -1, URI.spec, null, null);
    url.QueryInterface(Ci.nsIURL);
    
    switch (url.host) {
      case "viewer":
        var chromeURL = "chrome://sage/content/feedsummary.html";
        break;
      default:
        var chromeURL = "chrome://sage/content/feedsummary.html";
        break;
    }
    
    var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    var channel = ios.newChannel(chromeURL, null, null);
    
    return channel;
  },
  
  newURI : function(spec, originCharset, baseURI) {
    var url = Cc["@mozilla.org/network/simple-uri;1"].createInstance(Ci.nsIURI);

    try {
      url.spec = spec;
    } catch (e) {
      try {
        url.spec = this.scheme + ":" + spec;
      } catch (e) {
        url.spec = "javascript:void(0)";
      }
    }

    return url;
  },

  // nsIClassInfo
  getInterfaces : function(aCount) {
    var interfaces = [Ci.nsIProtocolHandler, Ci.nsIClassInfo];
    aCount.value = interfaces.length;
    return interfaces;
  },

  // nsIClassInfo
  getHelperForLanguage : function(aLanguage) {
    return null;
  },

  // nsIClassInfo
  contractID : CONTRACT_ID,

  // nsIClassInfo
  classDescription : CLASS_NAME,

  // nsIClassInfo
  classID : CLASS_ID,

  // nsIClassInfo
  implementationLanguage : Ci.nsIProgrammingLanguage.JAVASCRIPT,

  // nsIClassInfo
  flags : null,
  
  // nsISupports
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.nsISupports) &&
        !aIID.equals(Ci.nsIProtocolHandler) &&
        !aIID.equals(Ci.nsIClassInfo)) {
      throw Cr.NS_ERROR_NO_INTERFACE;
    }
    return this;
  }

};


/******************************************************************************
 * XPCOM Functions for construction and registration
 ******************************************************************************/
var Module = {
  _firstTime: true,
  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
  {
    if (this._firstTime) {
      this._firstTime = false;
      throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
    }
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
  },

  unregisterSelf: function(aCompMgr, aLocation, aType)
  {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);        
  },
  
  getClassObject: function(aCompMgr, aCID, aIID)
  {
    if (!aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    if (aCID.equals(CLASS_ID))
      return Factory;
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

var Factory = {
  createInstance: function(aOuter, aIID)
  {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    return (new sageProtocolHandler()).QueryInterface(aIID);
  }
};

function NSGetModule(aCompMgr, aFileSpec) { return Module; }