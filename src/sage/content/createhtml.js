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

var CreateHTML = {
	HTML_SOURCE: CommonFunc.loadText("chrome://sage/content/res/template-html.txt"),
	ITEM_SOURCE: CommonFunc.loadText("chrome://sage/content/res/template-item.txt"),
	DEFAULT_CSS: "chrome://sage/content/res/sage.css",

	_tabbed: false,

	set tabbed(aValue){ this._tabbed = aValue },

	openHTML: function(feed) {
		if(!feed) return;

		try {
			var htmlURL = this.createHTML(feed);
			if(this._tabbed) {
				getContentBrowser().addTab(htmlURL);
			} else {
				getContentBrowser().loadURI(htmlURL);
			}
		} catch(e) {
			dump(e);
		}
	},

	createHTML: function(feed) {
		var tmpFile = this.getSpecialDir("UChrm");
		tmpFile.appendRelativePath("sage.html");

		var ioService = Components.classes["@mozilla.org/network/io-service;1"]
							.getService(Components.interfaces.nsIIOService);
		var xmlFilePath = ioService.newFileURI(tmpFile).spec;

		if(tmpFile.exists()) {
			tmpFile.remove(true);
		}
		tmpFile.create(tmpFile.NORMAL_FILE_TYPE, 0666);

		var stream = Components.classes['@mozilla.org/network/file-output-stream;1']
						.createInstance(Components.interfaces.nsIFileOutputStream);
		stream.init(tmpFile, 2, 0x200, false); // open as "write only"

		var content = this.createHTMLSource(feed);
		stream.write(content, content.length);
		stream.flush();
		stream.close();

		return xmlFilePath;
	},

	getUserCssURL: function() {
		var userCssEnable = CommonFunc.getPrefValue(CommonFunc.USER_CSS_ENABLE, "bool", false);
		var userCssPath = CommonFunc.getPrefValue(CommonFunc.USER_CSS_PATH, "wstr", "");
		if(!userCssEnable || !userCssPath) return null;

		return userCssPath;

		/*

        we need to check for file path and convert to uri and check uris

		var ioService = Components.classes["@mozilla.org/network/io-service;1"]
							.getService(Components.interfaces.nsIIOService);
		var tmpFile = Components.classes['@mozilla.org/file/local;1']
							.createInstance(Components.interfaces.nsILocalFile);
		try {
			tmpFile.initWithPath(userCssPath);
			var cssUrl = ioService.newFileURI(tmpFile);
			var contentType = ioService.newChannelFromURI(cssUrl).contentType;
			if(contentType != "text/css") return null;

			return cssUrl.spec;
		} catch(e) {
			return null;
		}
		*/
	},

	formatFileSize:	function (n)
	{
		if (n > 1048576)
			return Math.round(n / 1048576) + "M";
		else if (n > 1024)
			return Math.round(n / 1024) + "K";
		else
			return n + "B";
	},

	createHTMLSource: function(feed)
	{
		return this.HTML_SOURCE.replace(/\*\*[^\*]+\*\*/g, function (s)
			{
				return CreateHTML.replaceFeedKeyword(feed, s);
			});

		return CommonFunc.convertCharCodeFrom(
			this.HTML_SOURCE.replace(/\*\*[^\*]+\*\*/g, function (s)
			{
				return CreateHTML.replaceFeedKeyword(feed, s);
			}),
			"UTF-8");
	},

	replaceFeedKeyword:	function (feed, s)
	{
		var footer;

		switch (s)
		{
			case "**CSSURL**":
				return this.getUserCssURL() || this.DEFAULT_CSS;

			case "**HTMLTITLE**":
			case "**TITLE**":
				return feed.getTitle();

			case "**LINK**":
				return feed.getLink();
				break;

			case "**AUTHOR**":
				return feed.getAuthor();

			case "**DESCRIPTION**":
				return feed.getDescription();

			case "**LOGOLINK**":
				return feed.getLogo().link;

			case "**LOGOALT**":
				return feed.getLogo().alt;

			case "**COPYRIGHT**":
				return feed.getFooter().copyright;

			case "**GENERATOR**":
				return feed.getFooter().generator;

			case "**EDITOR**":
				var editor = "";
				footer = feed.getFooter();
				if (footer.editor) {
					editor = "<a href=\"mailto:" + footer.editor + "\">Editor</a>";
					if (footer.webmaster)
						editor += ", ";
				}
				return editor;

			case "**WEBMASTER**":
				footer = feed.getFooter();
				if (footer.webmaster) {
					return "<a href=\"mailto:" + footer.webmaster + "\">" +
						strRes.getString("feed_summary_webmaster") +
						"</a>";
				}
				return "";

			case "**ITEMS**":
				return this.getItemsHtml(feed);
		}

		return s;
	},

	getItemsHtml:	function (feed)
	{
		var feedItemOrder = CommonFunc.getPrefValue(CommonFunc.FEED_ITEM_ORDER, "str", "chrono");
		var items = feed.getItems(feedItemOrder);
		var sb = [];
		for (var i = 0; i < items.length; i++)
		{
			sb.push(this.getItemHtml(feed, items[i], i));
		}
		return sb.join("");
	},

	getItemHtml:	function (feed, item, i)
	{
		return  this.ITEM_SOURCE.replace(/\*\*[^\*]+\*\*/g, function (s)
		{
			return CreateHTML.replaceFeedItemKeyword(feed, item, i, s);
		});
	},

	replaceFeedItemKeyword:	function (feed, item, i, s)
	{
		switch (s)
		{
			case "**NUMBER**":
				return i  +1;

			case "**LINK**":
				return item.getLink();

			case "**TECHNORATI**":
				return encodeURIComponent(item.getLink());

			case "**TITLE**":
				return item.getTitle();

			case "**AUTHOR**":
				return item.getAuthor();

			case "**DESCRIPTION**":
				if (item.hasContent())
				{
					var allowEContent = CommonFunc.getPrefValue(CommonFunc.ALLOW_ENCODED_CONTENT, "bool", true);
					var ds;
					if (allowEContent)
					{
						this.filterHtmlHandler.clear();
						this.simpleHtmlParser.parse(item.getContent());
						ds = this.filterHtmlHandler.toString();
					}
					else
					{
						ds = htmlToText(item.getContent());
					}
					return "<div class=\"item-desc\">" + ds + "</div>";
				}
				return "";

			case "**PUBDATE**":
				if (item.hasPubDate())
				{
					var twelveHourClock = CommonFunc.getPrefValue(CommonFunc.TWELVE_HOUR_CLOCK, "bool", false);
					return "<div class=\"item-pubDate\">" +
						dateFormat(item.getPubDate(), twelveHourClock) +
						"</div>";
				}
				return "";

			case "**ENCLOSURE**":
				if (item.hasEnclosure())
				{
					var enc = item.getEnclosure();
					return "<div class=\"item-enclosure\">" +
						"<a href=\"" + enc.getLink() + "\" title=\"" +
						strRes.getString("feed_summary_enclosure") +
						"\"><img src=\"" +
							(enc.hasMimeType() ?
								"moz-icon://dummy?size=16&contentType=" + enc.getMimeType() :
								"chrome://sage/skin/enclosure.png") +
						"\"> " +
						(enc.getDescription() ? enc.getDescription() + ", " : "") +
						(enc.hasLength() ? this.formatFileSize(enc.getLength()) : "") +
						"</a></div>";
				}
				return "";
		}

		return s;
	},

	getSpecialDir: function(aProp) {
		var dirService = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties);
		return dirService.get(aProp, Components.interfaces.nsILocalFile);
	},

	simpleHtmlParser:	new SimpleHtmlParser,
	filterHtmlHandler:	new FilterHtmlHandler
};

CreateHTML.simpleHtmlParser.contentHandler = CreateHTML.filterHtmlHandler
