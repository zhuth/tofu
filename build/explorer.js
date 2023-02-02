(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
'use strict';

var _tab = _interopRequireDefault(require("./ui/tab.js"));
var _paginator = _interopRequireDefault(require("./ui/paginator.js"));
var _storage = _interopRequireDefault(require("./storage.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const PAGE_SIZE = 50;

/**
 * Class Modal
 */
class Modal {
  constructor(selector) {
    this.modal = document.querySelector(selector);
  }
  static get instance() {
    if (!this._instance) {
      let instance = this._instance = new this();
      instance.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
    }
    return this._instance;
  }
  static show() {
    this.instance.modal.classList.add('is-active');
  }
  static close() {
    let instance = this.instance;
    instance.modal.classList.remove('is-active');
  }
}

/**
 * Class PictureModal
 */
class PictureModal extends Modal {
  constructor() {
    super('#picture-modal');
  }
  static show(src) {
    this.instance.modal.querySelector('.image>img').setAttribute('src', src);
    super.show();
  }
}

/**
 * Class MinorModal
 */
class MinorModal extends Modal {
  constructor() {
    super('#minor-modal');
  }
}

/**
 * Class Panel
 */
class Panel {
  clear() {
    this.container.innerHTML = '';
  }
  async load(total) {
    throw new Error('Not implemented');
  }
  constructor(container, page, pageSize) {
    this.container = container;
    this.page = page;
    this.pageSize = pageSize;
    this.userId = parseInt(location.search.substr(1));
    this.clear();
    $(container).on('click', '.image.preview>img', event => PictureModal.show(event.currentTarget.dataset.src));
  }
  get storage() {
    return new _storage.default(this.userId);
  }
  paging() {
    let page = this.page;
    let total = this.total;
    let pageSize = this.pageSize;
    let panel = this;
    let paginator = new _paginator.default(page, Math.ceil(total / pageSize));
    paginator.addEventListener('change', async event => {
      panel.clear();
      paginator.currentPage = panel.page = event.target.currentPage;
      await panel.load(total);
      paginator.load();
      paginator.appendTo(panel.container);
    });
    paginator.appendTo(panel.container);
  }
  static async render(tab, page = 1, pageSize = PAGE_SIZE) {
    const PANEL_CLASSES = {
      status: Status,
      interest: Interest,
      review: Review,
      annotation: Annotation,
      note: Note,
      photo: PhotoAlbum,
      follow: Follow,
      doumail: DoumailContact,
      doulist: Doulist,
      board: Board
    };
    let name = tab.getAttribute('name');
    let panel = new PANEL_CLASSES[name](tab, page, pageSize);
    panel.total = await panel.load();
    panel.paging();
  }
}

/**
 * Class SegmentsPanel
 */
class SegmentsPanel extends Panel {
  onToggle($target) {
    throw new Error('Not implemented');
  }
  constructor(container, page, pageSize) {
    let segments = container.querySelector('.segments.tabs');
    container = container.querySelector('.sub-container');
    super(container, page, pageSize);
    this.segments = segments;
    let $segmentLinks = $(this.segments).find('ul>li a');
    $segmentLinks.parent().removeClass('is-active');
    this.segments.querySelector('ul>li').classList.add('is-active');
    $segmentLinks.off('click');
    $segmentLinks.on('click', async event => {
      let $target = $(event.currentTarget);
      $segmentLinks.parent().removeClass('is-active');
      $target.parent().addClass('is-active');
      this.onToggle($target);
      this.clear();
      this.total = await this.load();
      this.paging();
    });
  }
}
const TEMPLATE_STATUS = `\
<article class="media status">
  <figure class="media-left">
    <p class="image is-64x64 avatar"><img></p>
  </figure>
  <div class="media-content">
    <div class="content">
      <p>
        <strong class="author name"></strong> <small class="author uid"></small> <span class="activity"></span>
        <br><small class="created"></small>
      </p>
      <p class="text"></p>
    </div>
    <div class="reshared-status is-hidden" style="margin-bottom: 1rem;"></div>
    <div class="columns is-1 is-multiline images is-hidden"></div>
    <div class="media box card is-hidden">
      <figure class="media-left">
        <p class="image"><img></p>
      </figure>
      <div class="media-content">
        <div class="content">
          <p class="title is-size-6"><a></a></p>
          <p class="subtitle is-size-7"></p>
        </div>
      </div>
    </div>
    <div class="content topic is-hidden">
      <p>
      <span class="icon">
        <i class="fas fa-hashtag"></i>
      </span>
        <a class="topic-title" target="_blank" title="前往豆瓣查看"></a>
        <small class="topic-subtitle"></small>
      </p>
    </div>
    <div class="level stat">
      <div class="level-left">
        <div class="level-item">
          <span class="icon">
            <i class="far fa-thumbs-up"></i>
          </span>
          <small class="likes"></small>
        </div>
        <div class="level-item">
          <span class="icon">
            <i class="fas fa-retweet"></i>
          </span>
          <small class="reshares"></small>
        </div>
        <div class="level-item">
          <span class="icon">
            <i class="far fa-comment-alt"></i>
          </span>
          <small class="comments"></small>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <a class="status-url" target="_blank" title="前往豆瓣查看">
            <span class="icon">
              <i class="fas fa-external-link-alt"></i>
            </span>
          </a>
        </div>
      </div>
    </div>
  </div>
</article>`;
const TEMPLATE_RESHARED_STATUS = `\
<article class="media status box">
  <figure class="media-left">
    <p class="image is-48x48 avatar"><img></p>
  </figure>
  <div class="media-content">
    <div class="content">
      <p class="is-size-7">
        <strong class="author name"></strong> <small class="author uid"></small> <span class="activity"></span>
        <br><small class="created"></small>
      </p>
      <p class="text is-size-7"></p>
    </div>
    <div class="columns is-1 is-multiline images is-hidden"></div>
    <div class="media box card is-hidden">
      <figure class="media-left">
        <p class="image"><img></p>
      </figure>
      <div class="media-content">
        <div class="content">
          <p class="title is-size-6"><a></a></p>
          <p class="subtitle is-size-7"></p>
        </div>
      </div>
    </div>
  </div>
</article>`;

/**
 * Class Status
 */
class Status extends Panel {
  async load(total) {
    let storage = this.storage;
    storage.local.open();
    let collection = await storage.local.status.orderBy('id').reverse().offset(this.pageSize * (this.page - 1)).limit(this.pageSize).toArray();
    if (!total) {
      total = await storage.local.status.count();
    }
    storage.local.close();
    for (let {
      status,
      comments
    } of collection) {
      let $status = $(TEMPLATE_STATUS);
      $status.find('.avatar>img').attr('src', status.author.avatar);
      $status.find('.author.name').text(status.author.name);
      $status.find('.author.uid').text('@' + status.author.uid);
      $status.find('.activity').text(status.activity + "：");
      $status.find('.created').text(status.create_time);
      if (status.parent_status) {
        let parentStatus = status.parent_status;
        let $statusText = $status.find('.text');
        $statusText.append($('<span>').text(status.text)).append('<span class="icon"><i class="fas fa-retweet"></i></span>');
        if (parentStatus.deleted) {
          $statusText.append(parentStatus.msg);
        } else {
          $statusText.append($(`<a>`).text(parentStatus.author.name).attr('href', parentStatus.author.url)).append(': ').append($('<span>').text(parentStatus.text));
        }
      } else {
        $status.find('.text').text(status.text);
      }
      $status.find('.status-url').attr('href', status.sharing_url);
      if (status.images && status.images.length > 0) {
        let $images = $status.find('.images').removeClass('is-hidden');
        status.images.forEach(image => {
          $images.append(`\
<div class="column is-one-third">
  <figure class="image preview is-128x128">
    <img src="${image.normal.url}" data-src="${image.large.url}">
  </figure>
</div>`);
        });
      }
      $status.find('.likes').text(status.like_count);
      $status.find('.reshares').text(status.reshares_count);
      $status.find('.comments').text(status.comments_count);
      if (status.card) {
        let $card = $status.find('.card').removeClass('is-hidden');
        let card = status.card;
        if (card.card_style == 'obsolete') {
          $card.find('.subtitle').text(card.obsolete_msg);
        } else {
          if (card.image) {
            $card.find('.image>img').attr('src', card.image.normal.url);
          }
          let $title = $card.find('.title>a');
          $title.text(card.title ? card.title : `${card.owner_name} ${card.activity}:`);
          $title.attr('href', card.url);
          $card.find('.subtitle').text(card.subtitle);
        }
      }
      if (status.topic) {
        let $topic = $status.find('.topic');
        let topic = status.topic;
        $topic.find('.topic-title').text(topic.title).attr('href', topic.url);
        $topic.find('.topic-subtitle').text(topic.card_subtitle);
        $topic.removeClass('is-hidden');
      }
      if (status.reshared_status) {
        let $resharedStatus;
        let resharedStatus = status.reshared_status;
        let $container = $status.find('.reshared-status').removeClass('is-hidden');
        if (resharedStatus.deleted || resharedStatus.hidden) {
          $resharedStatus = $(`<article class="box">${resharedStatus.msg}</article>`);
        } else {
          $resharedStatus = $(TEMPLATE_RESHARED_STATUS);
          $resharedStatus.find('.avatar>img').attr('src', resharedStatus.author.avatar);
          $resharedStatus.find('.author.name').text(resharedStatus.author.name);
          $resharedStatus.find('.author.uid').text('@' + resharedStatus.author.uid);
          $resharedStatus.find('.activity').text(resharedStatus.activity + "：");
          $resharedStatus.find('.created').text(resharedStatus.create_time);
          $resharedStatus.find('.text').text(resharedStatus.text);
          if (resharedStatus.images && resharedStatus.images.length > 0) {
            let $images = $resharedStatus.find('.images').removeClass('is-hidden');
            resharedStatus.images.forEach(image => {
              $images.append(`\
<div class="column is-one-third">
    <figure class="image preview is-128x128">
    <img src="${image.normal.url}" data-src="${image.large.url}">
    </figure>
</div>`);
            });
          }
          if (resharedStatus.card) {
            let $card = $resharedStatus.find('.card').removeClass('is-hidden');
            let card = resharedStatus.card;
            if (card.card_style == 'obsolete') {
              $card.find('.subtitle').text(card.obsolete_msg);
            } else {
              if (card.image) {
                $card.find('.image>img').attr('src', card.image.normal.url);
              }
              let $title = $card.find('.title>a');
              $title.text(card.title);
              $title.attr('href', card.url);
              $card.find('.subtitle').text(card.subtitle);
            }
          }
        }
        $container.append($resharedStatus);
      }
      $status.appendTo(this.container);
    }
    return total;
  }
}
const TEMPLATE_INTEREST = `\
<article class="media subject">
  <figure class="media-left">
    <p class="image subject-cover">
      <a class="subject-url" target="_blank" title="前往豆瓣查看"><img></a>
    </p>
  </figure>
  <div class="media-content">
    <div class="content">
      <p>
        <a class="subject-url title is-size-5" target="_blank" title="前往豆瓣查看"></a>
        <span class="rating">
          <label><span class="rating-count"></span>人评价</label>
          <label>豆瓣评分：<span class="rating-value is-size-4 has-text-danger"></span></label>
        </span>
      </p>
      <p class="subtitle is-size-6"></p>
    </div>
    <div class="box content my-rating">
      <p>
        <small class="create-time"></small>
        <small>我的评分：<span class="my-rating-value is-size-5 has-text-danger"></span></small>
        <small>标签：<span class="my-tags"></span></small>
        <br>
        <span class="my-comment"></span>
      </p>
    </div>
  </div>
</article>`;

/**
 * Class Interest
 */
class Interest extends SegmentsPanel {
  onToggle($target) {
    this.type = $target.data('type');
    this.status = $target.data('status');
  }
  constructor(container, page, pageSize) {
    super(container, page, pageSize);
    this.type = 'movie';
    this.status = 'done';
  }
  async load(total) {
    let storage = this.storage;
    storage.local.open();
    let versionInfo = await storage.local.table('version').get({
      table: 'interest'
    });
    if (!versionInfo) {
      storage.local.close();
      return 0;
    }
    let currentVersion = versionInfo.version;
    let collection = await storage.local.interest
    //.where({ version: currentVersion, type: this.type, status: this.status })
    .where({
      type: this.type,
      status: this.status
    }).offset(this.pageSize * (this.page - 1)).limit(this.pageSize).reverse().toArray();
    if (!total) {
      total = await storage.local.interest
      //.where({ version: currentVersion, type: this.type, status: this.status })
      .where({
        type: this.type,
        status: this.status
      }).count();
    }
    storage.local.close();
    for (let {
      interest,
      version
    } of collection) {
      let $interest = $(TEMPLATE_INTEREST);
      let subject = interest.subject;
      $interest.find('.subject-cover img').attr('src', subject.pic.normal);
      $interest.find('.title').text(subject.title);
      $interest.find('.subject-url').attr('href', subject.url);
      if (interest.subject.null_rating_reason) {
        $interest.find('.rating').text(subject.null_rating_reason);
      } else {
        $interest.find('.rating-value').text(subject.rating.value.toFixed(1));
        $interest.find('.rating-count').text(subject.rating.count);
      }
      $interest.find('.subtitle').text(subject.card_subtitle);
      $interest.find('.create-time').text(interest.create_time);
      $interest.find('.my-comment').text(interest.comment);
      $interest.find('.my-tags').text(interest.tags);
      interest.rating && $interest.find('.my-rating-value').text(interest.rating.value);
      version < currentVersion && $interest.addClass('is-obsolete');
      $interest.appendTo(this.container);
    }
    return total;
  }
}
const TEMPLATE_REVIEW = `\
<article class="media subject">
  <figure class="media-left">
    <p class="image subject-cover">
      <a class="subject-url" target="_blank" title="前往豆瓣查看"><img></a>
    </p>
  </figure>
  <div class="media-content">
    <div class="content">
      <p>
        <a class="subject-url title is-size-5" target="_blank" title="前往豆瓣查看"></a>
        <span class="rating">
          <label><span class="rating-count"></span>人评价</label>
          <label>豆瓣评分：<span class="rating-value is-size-4 has-text-danger"></span></label>
        </span>
      </p>
      <p class="subtitle is-size-6"></p>
    </div>
    <div class="box content review">
      <p>
        <a class="review-title review-url is-size-5" target="_blank"></a>
        <small>我的评分：<span class="my-rating is-size-5 has-text-danger"></span></small><br>
        <small><span class="create-time"></span> 发布<span class="type-name"></span></small>
        <span class="tag is-normal useful"></span>
        <span class="tag is-normal useless"></span>
        <span class="tag is-normal comments"></span>
        <span class="tag is-normal reads"></span>
      </p>
      <p class="abstract"></p>
    </div>
  </div>
</article>`;

/**
 * Class Review
 */
class Review extends SegmentsPanel {
  async showReview(reviewId, version) {
    let storage = this.storage;
    storage.local.open();
    let {
      review
    } = await storage.local.review.get({
      id: reviewId
    });
    storage.local.close();
    let container = MinorModal.instance.modal.querySelector('.box');
    container.innerHTML = '';
    let $article = $(TEMPLATE_ARTICLE);
    $article.find('.title').text(review.title);
    $article.find('.content').html(review.fulltext);
    $article.appendTo(container);
    MinorModal.show();
  }
  onToggle($target) {
    this.type = $target.data('type');
  }
  constructor(container, page, pageSize) {
    super(container, page, pageSize);
    this.type = 'movie';
  }
  async load(total) {
    let storage = this.storage;
    storage.local.open();
    let versionInfo = await storage.local.table('version').get({
      table: 'review'
    });
    if (!versionInfo) {
      storage.local.close();
      return 0;
    }
    let currentVersion = versionInfo.version;
    let collection = await storage.local.review
    //.where({ version: currentVersion, type: this.type })
    .where({
      type: this.type
    }).offset(this.pageSize * (this.page - 1)).limit(this.pageSize).reverse().toArray();
    if (!total) {
      total = await storage.local.review
      //.where({ version: currentVersion, type: this.type })
      .where({
        type: this.type
      }).count();
    }
    storage.local.close();
    for (let {
      id,
      version,
      review
    } of collection) {
      let $review = $(TEMPLATE_REVIEW);
      $review.find('.subject-cover img').attr('src', review.subject.pic.normal);
      $review.find('.subject-url').attr('href', review.subject.url);
      $review.find('.title').text(review.subject.title);
      $review.find('.review-title').text(review.title).click(async event => {
        event.preventDefault();
        await this.showReview(id, currentVersion);
        return false;
      });
      $review.find('.review-url').attr('href', review.url);
      $review.find('.subtitle').text(review.subject.card_subtitle);
      if (review.subject.null_rating_reason) {
        $review.find('.rating').text(review.subject.null_rating_reason);
      } else {
        $review.find('.rating-value').text(review.subject.rating.value.toFixed(1));
        $review.find('.rating-count').text(review.subject.rating.count);
      }
      $review.find('.create-time').text(review.create_time);
      if (review.rating) {
        $review.find('.my-rating').text(review.rating.value);
      } else {
        $review.find('.my-rating').parent().addClass('is-hidden');
      }
      $review.find('.useful').text('有用 ' + review.useful_count);
      $review.find('.useless').text('没用 ' + review.useless_count);
      $review.find('.comments').text(review.comments_count + ' 回应');
      $review.find('.reads').text(review.read_count + ' 阅读');
      $review.find('.abstract').text(review.abstract);
      $review.find('.type-name').text(review.type_name);
      version < currentVersion && $review.addClass('is-obsolete');
      $review.appendTo(this.container);
    }
    return total;
  }
}
const TEMPLATE_NOTE = `\
<article class="media note">
  <div class="media-content">
    <div class="content">
      <p>
        <a class="title is-size-5" target="_blank"></a>
        <br>
        <small class="create-time"></small>
        <span class="tag is-normal comments"></span>
        <span class="tag is-normal reads"></span>
      </p>
      <p class="abstract"></p>
    </div>
  </div>
  <figure class="media-right is-hidden">
    <p class="image cover">
      <img>
    </p>
  </figure>
</article>`;
const TEMPLATE_ARTICLE = `\
<div class="content article">
    <h1 class="title"></h1>
    <div class="content"></div>
</div>`;

/**
 * Class Note
 */
class Note extends Panel {
  async showNote(noteId, version) {
    let storage = this.storage;
    storage.local.open();
    let {
      note
    } = await storage.local.note.get({
      id: noteId
    });
    storage.local.close();
    let container = MinorModal.instance.modal.querySelector('.box');
    container.innerHTML = '';
    let $article = $(TEMPLATE_ARTICLE);
    $article.find('.title').text(note.title);
    $article.find('.content').html(note.fulltext);
    $article.appendTo(container);
    MinorModal.show();
  }
  async load(total) {
    let storage = this.storage;
    storage.local.open();
    let versionInfo = await storage.local.table('version').get({
      table: 'note'
    });
    if (!versionInfo) {
      storage.local.close();
      return 0;
    }
    let currentVersion = versionInfo.version;
    let collection = await storage.local.note
    //.where({ version: currentVersion })
    .offset(this.pageSize * (this.page - 1)).limit(this.pageSize).reverse().toArray();
    if (!total) {
      total = await storage.local.note
      //.where({ version: currentVersion })
      .count();
    }
    storage.local.close();
    for (let {
      id,
      version,
      note
    } of collection) {
      let $note = $(TEMPLATE_NOTE);
      $note.find('.title').text(note.title).attr('href', note.url).click(async event => {
        event.preventDefault();
        await this.showNote(id, version);
        return false;
      });
      $note.find('.create-time').text(note.create_time);
      note.cover_url && $note.find('.media-right .image>img').attr('src', note.cover_url).parents('.media-right').removeClass('is-hidden');
      $note.find('.comments').text(note.comments_count + ' 回应');
      $note.find('.reads').text(note.read_count + ' 阅读');
      $note.find('.abstract').text(note.abstract);
      version < currentVersion && $note.addClass('is-obsolete');
      $note.appendTo(this.container);
    }
    return total;
  }
}
const TEMPLATE_SUBJECT_ANNOTATION = `\
<article class="media subject">
  <figure class="media-left">
    <p class="image subject-cover">
      <a class="subject-url" target="_blank" title="前往豆瓣查看"><img></a>
    </p>
  </figure>
  <div class="media-content">
    <div class="content">
      <p>
        <a class="subject-url title is-size-5" target="_blank" title="前往豆瓣查看"></a>
        <span class="rating">
          <label><span class="rating-count"></span>人评价</label>
          <label>豆瓣评分：<span class="rating-value is-size-4 has-text-danger"></span></label>
        </span>
      </p>
      <p class="subtitle is-size-6"></p>
    </div>
    <div class="box content annotation">
      <p>
        <a class="annotation-title annotation-url is-size-5" target="_blank"></a>
        <small>我的评分：<span class="my-rating is-size-5 has-text-danger"></span></small><br>
        <small><span class="create-time"></span> 发布<span class="type-name"></span></small>
        <span class="tag is-normal comments"></span>
        <span class="tag is-normal reads"></span><br>
        <small>章节：<span class="chapter"></span></small><br>
        <small>页码：<span class="page"></span></small>
      </p>
      <p class="abstract"></p>
    </div>
  </div>
</article>`;
const TEMPLATE_ANNOTATION = `\
<article class="media no-subject">
  <div class="media-content">
    <div class="box content annotation">
      <p>
        <a class="annotation-title annotation-url is-size-5" target="_blank"></a>
        <small>我的评分：<span class="my-rating is-size-5 has-text-danger"></span></small><br>
        <small><span class="create-time"></span> 发布<span class="type-name"></span></small>
        <span class="tag is-normal comments"></span>
        <span class="tag is-normal reads"></span><br>
        <small>章节：<span class="chapter"></span></small><br>
        <small>页码：<span class="page"></span></small>
      </p>
      <p class="abstract"></p>
    </div>
  </div>
</article>`;

/**
 * Class Annotation
 */
class Annotation extends Panel {
  async showAnnotation(annotationId, version) {
    let storage = this.storage;
    storage.local.open();
    let {
      annotation
    } = await storage.local.annotation.get({
      id: annotationId
    });
    storage.local.close();
    let container = MinorModal.instance.modal.querySelector('.box');
    container.innerHTML = '';
    let $article = $(TEMPLATE_ARTICLE);
    $article.find('.title').text(annotation.title);
    $article.find('.content').html(annotation.fulltext);
    $article.appendTo(container);
    MinorModal.show();
  }
  async load(total) {
    let storage = this.storage;
    storage.local.open();
    let versionInfo = await storage.local.table('version').get({
      table: 'annotation'
    });
    if (!versionInfo) {
      storage.local.close();
      return 0;
    }
    let currentVersion = versionInfo.version;
    let collection = await storage.local.annotation.offset(this.pageSize * (this.page - 1)).limit(this.pageSize).reverse().toArray();
    if (!total) {
      total = await storage.local.annotation.count();
    }
    storage.local.close();
    for (let {
      id,
      version,
      annotation
    } of collection) {
      let subject = annotation.subject;
      let $annotation;
      if (subject) {
        $annotation = $(TEMPLATE_SUBJECT_ANNOTATION);
        $annotation.find('.subject-cover img').attr('src', subject.pic.normal);
        $annotation.find('.subject-url').attr('href', subject.url);
        $annotation.find('.title').text(subject.title);
        $annotation.find('.subtitle').text(subject.card_subtitle);
        if (subject.null_rating_reason) {
          $annotation.find('.rating').text(subject.null_rating_reason);
        } else {
          $annotation.find('.rating-value').text(subject.rating.value.toFixed(1));
          $annotation.find('.rating-count').text(subject.rating.count);
        }
      } else {
        $annotation = $(TEMPLATE_ANNOTATION);
      }
      $annotation.find('.annotation-title').text(annotation.title).click(async event => {
        event.preventDefault();
        await this.showAnnotation(id, currentVersion);
        return false;
      });
      $annotation.find('.annotation-url').attr('href', annotation.url);
      $annotation.find('.create-time').text(annotation.create_time);
      if (annotation.rating) {
        $annotation.find('.my-rating').text(annotation.rating.value);
      } else {
        $annotation.find('.my-rating').parent().addClass('is-hidden');
      }
      $annotation.find('.chapter').text(annotation.chapter);
      $annotation.find('.page').text(annotation.page);
      $annotation.find('.comments').text(annotation.comments_count + ' 回应');
      $annotation.find('.reads').text(annotation.read_count + ' 阅读');
      $annotation.find('.abstract').text(annotation.abstract);
      version < currentVersion && $annotation.addClass('is-obsolete');
      $annotation.appendTo(this.container);
    }
    return total;
  }
}
const TEMPLATE_COLUMNS = '<div class="columns is-multiline"></div>';
const TEMPLATE_ALBUM = `\
<div class="column album is-one-quarter">
  <figure class="image is-fullwidth" style="margin-bottom: 0.5rem;">
    <a class="album-url"><img></a>
  </figure>
  <p class="has-text-centered">
    <a class="album-url title is-size-6 has-text-weight-normal"></a>
    (<small class="total"></small>)<br>
    <small class="create-time"></small>
  </p>
  <p class="subtitle is-size-7 description"></p>
</div>`;
const TEMPLATE_PHOTO = `\
<div class="column photo is-one-quarter">
  <figure class="image is-fullwidth" style="margin-bottom: 0.5rem; max-height: 170px; overflow: hidden;">
    <a class="album-url"><img></a>
  </figure>
  <p class="subtitle is-size-7 description"></p>
</div>`;

/**
 * Class PhotoAlbum
 */
class PhotoAlbum extends Panel {
  async showAlbum(albumId) {
    let container = MinorModal.instance.modal.querySelector('.box');
    let panel = new Photo(container, 1, 40);
    MinorModal.show();
    panel.album = albumId;
    panel.total = await panel.load();
    panel.paging();
  }
  async load(total) {
    let storage = this.storage;
    storage.local.open();
    let versionInfo = await storage.local.table('version').get({
      table: 'photo'
    });
    if (!versionInfo) {
      storage.local.close();
      return 0;
    }
    let currentVersion = versionInfo.version;
    let collection = await storage.local.album.offset(this.pageSize * (this.page - 1)).limit(this.pageSize).reverse().toArray();
    if (!total) {
      total = await storage.local.album.count();
    }
    storage.local.close();
    let $albums = $(TEMPLATE_COLUMNS);
    for (let {
      id,
      album,
      version
    } of collection) {
      let $album = $(TEMPLATE_ALBUM);
      $album.find('.image img').attr('src', album.cover_url);
      $album.find('.title').text(album.title);
      $album.find('.total').text(album.photos_count);
      $album.find('.description').text(album.description);
      $album.find('.create-time').text(album.create_time);
      $album.find('.album-url').attr('href', album.url).click(async event => {
        event.preventDefault();
        await this.showAlbum(id);
        return false;
      });
      version < currentVersion && $album.addClass('is-obsolete');
      $album.appendTo($albums);
    }
    $albums.appendTo(this.container);
    return total;
  }
}

/**
 * Class Photo
 */
class Photo extends Panel {
  async load(total) {
    let albumId = this.album;
    let storage = this.storage;
    storage.local.open();
    let versionInfo = await storage.local.table('version').get({
      table: 'photo'
    });
    if (!versionInfo) {
      storage.local.close();
      return 0;
    }
    let currentVersion = versionInfo.version;
    let collection = await storage.local.photo.where({
      album: albumId
    }).offset(this.pageSize * (this.page - 1)).limit(this.pageSize).reverse().toArray();
    if (!total) {
      total = await storage.local.photo.where({
        album: albumId
      }).count();
    }
    storage.local.close();
    let $photos = $(TEMPLATE_COLUMNS);
    for (let {
      photo,
      version
    } of collection) {
      let $photo = $(TEMPLATE_PHOTO);
      $photo.find('.image img').attr('src', photo.cover).click(() => {
        PictureModal.show(photo.raw);
      });
      $photo.find('.description').text(photo.description);
      version < currentVersion && $photo.addClass('is-obsolete');
      $photo.appendTo($photos);
    }
    $photos.appendTo(this.container);
    return total;
  }
}
const TEMPLATE_USER_INFO = `\
<article class="media user">
  <figure class="media-left">
    <p class="image is-64x64 avatar">
      <a class="user-url" target="_blank" title="前往豆瓣查看"><img></a>
    </p>
  </figure>
  <div class="media-content">
    <div class="content">
      <p>
        <a class="user-url" target="_blank" title="前往豆瓣查看"><strong class="username"></strong></a>
        <small class="user-symbol"></small>
        <small class="is-hidden">(<span class="remark"></span>)</small>
        <small class="is-hidden"><br>常居：<span class="loc"></span></small>
        <small class="is-hidden"><br>签名：<span class="signature"></span></small>
        <br>
        <small class="is-hidden">被 <span class="followers"></span> 人关注</small>
        <small class="is-hidden">关注 <span class="following"></span> 人</small>
        <small class="followed is-hidden">已关注</small>
      </p>
    </div>
    <div class="columns user-data"></div>
  </div>
</article>`;

/**
 * Class Following
 */
class Following extends Panel {
  async load(total) {
    let storage = this.storage;
    storage.local.open();
    let versionInfo = await storage.local.table('version').get({
      table: 'following'
    });
    if (!versionInfo) {
      storage.local.close();
      return 0;
    }
    let version = versionInfo.version;
    let collection = await storage.local.following.where({
      version: version
    }).offset(this.pageSize * (this.page - 1)).limit(this.pageSize).toArray();
    if (!total) {
      total = await storage.local.following.where({
        version: version
      }).count();
    }
    storage.local.close();
    for (let {
      user
    } of collection) {
      let $userInfo = $(TEMPLATE_USER_INFO);
      $userInfo.find('.avatar img').attr('src', user.avatar);
      $userInfo.find('.user-url').attr('href', user.url);
      $userInfo.find('.username').text(user.name);
      $userInfo.find('.user-symbol').text('@' + user.uid);
      user.following_count && $userInfo.find('.following').text(user.following_count).parent().removeClass('is-hidden');
      user.followers_count && $userInfo.find('.followers').text(user.followers_count).parent().removeClass('is-hidden');
      user.loc && $userInfo.find('.loc').text(user.loc.name).parent().removeClass('is-hidden');
      user.remark && $userInfo.find('.remark').text(user.remark).parent().removeClass('is-hidden');
      user.signature && $userInfo.find('.signature').text(user.signature).parent().removeClass('is-hidden');
      $userInfo.appendTo(this.container);
    }
    return total;
  }
}

/**
 * Class Follower
 */
class Follower extends Panel {
  async load(total) {
    let storage = this.storage;
    storage.local.open();
    let versionInfo = await storage.local.table('version').get({
      table: 'follower'
    });
    if (!versionInfo) {
      storage.local.close();
      return 0;
    }
    let version = versionInfo.version;
    let collection = await storage.local.follower.where({
      version: version
    }).offset(this.pageSize * (this.page - 1)).limit(this.pageSize).toArray();
    if (!total) {
      total = await storage.local.follower.where({
        version: version
      }).count();
    }
    storage.local.close();
    for (let {
      user
    } of collection) {
      let $userInfo = $(TEMPLATE_USER_INFO);
      $userInfo.find('.avatar img').attr('src', user.avatar);
      $userInfo.find('.user-url').attr('href', user.url);
      $userInfo.find('.username').text(user.name);
      $userInfo.find('.user-symbol').text('@' + user.uid);
      user.loc && $userInfo.find('.loc').text(user.loc.name).parent().removeClass('is-hidden');
      user.following_count && $userInfo.find('.following').text(user.following_count).parent().removeClass('is-hidden');
      user.followers_count && $userInfo.find('.followers').text(user.followers_count).parent().removeClass('is-hidden');
      user.signature && $userInfo.find('.signature').text(user.signature).parent().removeClass('is-hidden');
      $userInfo.appendTo(this.container);
    }
    return total;
  }
}

/**
 * Class Blacklist
 */
class Blacklist extends Panel {
  async load(total) {
    let storage = this.storage;
    storage.local.open();
    let versionInfo = await storage.local.table('version').get({
      table: 'blacklist'
    });
    if (!versionInfo) {
      storage.local.close();
      return 0;
    }
    let version = versionInfo.version;
    let collection = await storage.local.blacklist.where({
      version: version
    }).offset(this.pageSize * (this.page - 1)).limit(this.pageSize).toArray();
    if (!total) {
      total = await storage.local.blacklist.where({
        version: version
      }).count();
    }
    storage.local.close();
    for (let {
      user
    } of collection) {
      let $userInfo = $(TEMPLATE_USER_INFO);
      $userInfo.find('.avatar img').attr('src', user.avatar);
      $userInfo.find('.user-url').attr('href', user.url);
      $userInfo.find('.username').text(user.name);
      $userInfo.find('.user-symbol').text('@' + user.uid);
      $userInfo.appendTo(this.container);
    }
    return total;
  }
}

/**
 * Class Follow
 */
class Follow extends SegmentsPanel {
  onToggle($target) {
    switch ($target.data('type')) {
      case 'following':
        this.target = new Following(this.container, 1, this.pageSize);
        break;
      case 'follower':
        this.target = new Follower(this.container, 1, this.pageSize);
        break;
      case 'blacklist':
        this.target = new Blacklist(this.container, 1, this.pageSize);
        break;
    }
  }
  get page() {
    return this.target.page;
  }
  set page(value) {
    this.target && (this.target.page = value);
  }
  constructor(container, page, pageSize) {
    super(container, page, pageSize);
    this.target = new Following(this.container, page, pageSize);
  }
  async load(total) {
    return await this.target.load(total);
  }
}
const TEMPLATE_DOUMAIL_CONTACT = `\
<article class="media contact">
  <figure class="media-left">
    <p class="image is-48x48 avatar">
      <a class="doumail-url" target="_blank" title="前往豆瓣查看"><img></a>
    </p>
  </figure>
  <div class="media-content">
    <div class="content">
      <p>
        <a class="doumail-url username" target="_blank"></a>
        <br>
        <span class="abstract"></span>
      </p>
    </div>
    <div class="columns user-data"></div>
  </div>
  <div class="media-right">
    <span class="time"></span>
  </div>
</article>`;

/**
 * Class DoumailContact
 */
class DoumailContact extends Panel {
  async showDoumail(contactId) {
    let container = MinorModal.instance.modal.querySelector('.box');
    let panel = new Doumail(container, 1, PAGE_SIZE);
    MinorModal.show();
    panel.contact = contactId;
    panel.total = await panel.load();
    panel.paging();
  }
  async load(total) {
    let storage = this.storage;
    storage.local.open();
    let collection = await storage.local.doumailContact.orderBy('rank').reverse().offset(this.pageSize * (this.page - 1)).limit(this.pageSize).toArray();
    if (!total) {
      total = await storage.local.doumailContact.count();
    }
    storage.local.close();
    for (let {
      id,
      contact,
      abstract,
      time,
      url
    } of collection) {
      let $contact = $(TEMPLATE_DOUMAIL_CONTACT);
      contact.avatar && $contact.find('.avatar img').attr('src', contact.avatar);
      $contact.find('.doumail-url').attr('href', url).click(async event => {
        event.preventDefault();
        await this.showDoumail(id);
        return false;
      });
      $contact.find('.username').text(contact.name);
      $contact.find('.abstract').text(abstract);
      $contact.find('.time').text(time);
      $contact.appendTo(this.container);
    }
    return total;
  }
}
const TEMPLATE_DOUMAIL = `\
<article class="media doumail">
  <figure class="media-left">
    <p class="image is-48x48 avatar">
      <a class="sender-url" target="_blank" title="前往豆瓣查看"><img></a>
    </p>
  </figure>
  <div class="media-content">
    <a class="sender-url sender" target="_blank"></a><br>
    <small class="datetime"></small>
    <div class="content"></div>
  </div>
  <div class="media-right">
  </div>
</article>`;

/**
 * Class Doumail
 */
class Doumail extends Panel {
  async load(total) {
    let contactId = this.contact;
    let storage = this.storage;
    storage.local.open();
    let collection = await storage.local.doumail.where({
      contact: contactId
    }).offset(this.pageSize * (this.page - 1)).limit(this.pageSize).toArray();
    if (!total) {
      total = await storage.local.doumail.where({
        contact: contactId
      }).count();
    }
    storage.local.close();
    for (let mail of collection) {
      let $mail = $(TEMPLATE_DOUMAIL);
      $mail.find('.avatar img').attr('src', mail.sender.avatar);
      $mail.find('.datetime').text(mail.datetime);
      $mail.find('.sender').text(mail.sender.name);
      $mail.find('.content').html(mail.content);
      $mail.find('.sender-url').attr('href', mail.sender.url);
      $mail.appendTo(this.container);
    }
    return total;
  }
}
const TEMPLATE_DOULIST = `\
<article class="media doulist">
  <figure class="media-left">
    <p class="image cover">
      <img>
    </p>
  </figure>
  <div class="media-content">
    <div class="content">
      <p>
        <a class="title is-size-6" target="_blank"></a>
        <span class="is-private icon is-hidden">
          <i class="fas fa-lock"></i>
        </span>
        <small>(<span class="items-count"></span>)</small><br>
        <small>作者：<a class="author" target="_blank"></a></small>
        <small>创建于 <span class="create-time"></span></small>
        <small>更新于 <span class="update-time"></span></small><br>
        <small>标签：<span class="doulist-tags"></span></small>
        <small>分类：<span class="category"></span></small>
      </p>
      <p class="description is-size-7"></p>
    </div>
  </div>
</article>`;

/**
 * Class Doulist
 */
class Doulist extends SegmentsPanel {
  onToggle($target) {
    this.type = $target.data('type');
  }
  constructor(container, page, pageSize) {
    super(container, page, pageSize);
    this.type = 'owned';
  }
  async showDoulist(doulistId) {
    let container = MinorModal.instance.modal.querySelector('.box');
    let panel = new DoulistItem(container, 1, PAGE_SIZE);
    MinorModal.show();
    panel.doulist = doulistId;
    panel.total = await panel.load();
    panel.paging();
  }
  async load(total) {
    let storage = this.storage;
    storage.local.open();
    let collection = await storage.local.doulist.where({
      type: this.type
    }).offset(this.pageSize * (this.page - 1)).limit(this.pageSize).reverse().toArray();
    if (!total) {
      total = await storage.local.doulist.where({
        type: this.type
      }).count();
    }
    storage.local.close();
    for (let {
      id,
      doulist
    } of collection) {
      let $doulist = $(TEMPLATE_DOULIST);
      $doulist.find('.cover img').attr('src', doulist.cover_url);
      $doulist.find('.title').text(doulist.title).attr('href', doulist.url).click(async event => {
        event.preventDefault();
        await this.showDoulist(id);
        return false;
      });
      $doulist.find('.author').text(doulist.owner.name).attr('href', doulist.owner.url);
      $doulist.find('.create-time').text(doulist.create_time);
      doulist.is_private && $doulist.find('.is-private').removeClass('is-hidden');
      $doulist.find('.update-time').text(doulist.update_time);
      $doulist.find('.doulist-tags').text(doulist.tags);
      $doulist.find('.items-count').text(doulist.items_count);
      $doulist.find('.description').text(doulist.desc);
      $doulist.find('.category').text(doulist.category);
      $doulist.appendTo(this.container);
    }
    return total;
  }
}
const TEMPLATE_DOULIST_ITEM = `\
<article class="media doulist-item">
  <figure class="media-left is-hidden">
    <p class="image picture">
      <img>
    </p>
  </figure>
  <div class="media-content">
    <div class="content">
      <p>
        <a class="title is-size-6" target="_blank"></a>
        <small>来源：<span class="source"></span></small>
      </p>
      <p class="abstract is-size-7"></p>
      <p class="status-text is-size-7"></p>
      <div class="status-images columns is-multiline is-hidden"></div>
      <blockquote class="comment is-hidden"></blockquote>
    </div>
  </div>
</article>`;

/**
 * Class DoulistItem
 */
class DoulistItem extends Panel {
  async load(total) {
    let doulistId = this.doulist;
    let storage = this.storage;
    storage.local.open();
    let collection = await storage.local.doulistItem.where({
      doulist: doulistId
    }).offset(this.pageSize * (this.page - 1)).limit(this.pageSize).reverse().toArray();
    if (!total) {
      total = await storage.local.doulistItem.where({
        doulist: doulistId
      }).count();
    }
    storage.local.close();
    for (let {
      item
    } of collection) {
      let $item = $(TEMPLATE_DOULIST_ITEM);
      item.picture && $item.find('.picture>img').attr('src', item.picture).parents('.media-left').removeClass('is-hidden');
      $item.find('.title').text(item.title).attr('href', item.url);
      $item.find('.abstract').text(item.abstract);
      $item.find('.source').text(item.source);
      item.comment && $item.find('.comment').text(item.comment).removeClass('is-hidden');
      if (item.extra.status) {
        $item.find('.status-text').text(item.extra.status.text);
        let $images = $item.find('.status-images').removeClass('is-hidden');
        for (let src of item.extra.status.images) {
          $images.append(`\
<div class="column is-one-quarter">
  <figure class="image preview is-128x128">
    <img src="${src}" data-src="${src}" style="overflow: hidden;">
  </figure>
</div>`);
        }
      }
      $item.appendTo(this.container);
    }
    return total;
  }
}
const TEMPLATE_BOARD = `\
<article class="media contact">
  <figure class="media-left">
    <p class="image is-48x48 avatar">
      <a class="board-sender-url" target="_blank"><img></a>
    </p>
  </figure>
  <div class="media-content">
    <div class="content">
      <p>
        <a class="board-sender-url username" target="_blank"></a>
        <br>
        <span class="text"></span>
      </p>
    </div>
    <div class="columns user-data"></div>
  </div>
  <div class="media-right">
    <span class="time"></span>
  </div>
</article>`;

/**
 * Class Board
 */
class Board extends Panel {
  async load(total) {
    let storage = this.storage;
    storage.local.open();
    let collection = await storage.local.board.reverse().offset(this.pageSize * (this.page - 1)).limit(this.pageSize).toArray();
    if (!total) {
      total = await storage.local.board.count();
    }
    storage.local.close();
    for (let {
      id,
      message,
      sender,
      sendTime
    } of collection) {
      let $message = $(TEMPLATE_BOARD);
      $message.find('.avatar img').attr('src', sender.avatar);
      $message.find('.username').text(sender.name);
      $message.find('.text').text(message);
      $message.find('.time').text(sendTime);
      $message.appendTo(this.container);
    }
    return total;
  }
}

/**
 * Class ExporModal
 */
class ExportModal {
  constructor(selector) {
    this.element = document.querySelector(selector);
  }
  static init() {
    let modal = new ExportModal('#export-modal');
    ExportModal.instance = modal;
    modal.element.querySelectorAll('.cancel').forEach(item => {
      item.addEventListener('click', () => modal.close());
    });
    $('.button[name="export"]').click(() => modal.open());
    modal.element.querySelector('.select-all').addEventListener('change', event => {
      modal.element.querySelectorAll('input[name="item"]').forEach(item => {
        item.checked = event.target.checked;
      });
    });
    modal.element.querySelector('.button[name="export"]').addEventListener('click', async () => {
      modal.close();
      let checkedItems = modal.element.querySelectorAll('input[name="item"]:checked');
      if (!checkedItems.length) return false;
      let items = new Array(checkedItems.length);
      for (let i = 0; i < checkedItems.length; i++) {
        items[i] = checkedItems[i].value;
      }
      let $loading = $(`\
<div class="modal is-active">
  <div class="modal-background"></div>
  <div class="modal-content" style="width: 6rem;">
    <a class="button is-loading is-fullwidth is-large">Loading</a>
  </div>
</div>`);
      $loading.appendTo(document.body);
      let exporter = new Exporter();
      await exporter.export(items);
      exporter.save();
      $loading.remove();
    });
    return modal;
  }
  open() {
    this.element.classList.add('is-active');
  }
  close() {
    this.element.classList.remove('is-active');
  }
}

/**
 * Class Exporter
 */
class Exporter {
  constructor() {
    this.userId = parseInt(location.search.substr(1));
    this.workbook = XLSX.utils.book_new();
  }
  async exportInterest(storage) {
    let sheetNames = {
      'movie/done': '看过',
      'movie/doing': '在看',
      'movie/mark': '想看',
      'music/done': '听过',
      'music/doing': '在听',
      'music/mark': '想听',
      'book/done': '读过',
      'book/doing': '在读',
      'book/mark': '想读',
      'game/done': '玩过',
      'game/doing': '在玩',
      'game/mark': '想玩',
      'drama/done': '看过的舞台剧',
      'drama/mark': '想看的舞台剧'
    };
    for (let type of ['movie', 'music', 'book', 'game', 'drama']) {
      for (let status of ['done', 'doing', 'mark']) {
        let sheetName = sheetNames[`${type}/${status}`];
        if (!sheetName) continue;
        let collection = storage.local.interest.where({
          type: type,
          status: status
        }).reverse();
        let data = [['标题', '简介', '豆瓣评分', '链接', '创建时间', '我的评分', '标签', '评论', '可见性']];
        await collection.each(row => {
          let {
            subject,
            tags,
            rating,
            comment,
            create_time,
            is_private
          } = row.interest;
          data.push([subject.title, subject.card_subtitle, subject.rating ? subject.rating.value.toFixed(1) : subject.null_rating_reason, subject.url, create_time, rating ? rating.value : '', tags.toString(), comment, is_private ? "private" : "public"]);
        });
        let worksheet = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(this.workbook, worksheet, sheetName);
      }
    }
  }
  async exportReview(storage) {
    let sheetNames = {
      'movie': '影评',
      'music': '乐评',
      'book': '书评',
      'drama': '剧评',
      'game': '游戏评论&攻略'
    };
    for (let type in sheetNames) {
      let collection = storage.local.review.where({
        type: type
      }).reverse();
      let data = [['标题', '评论对象', '链接', '创建时间', '我的评分', '类型', '内容']];
      await collection.each(row => {
        let {
          subject,
          url,
          rating,
          fulltext,
          title,
          create_time,
          type_name
        } = row.review;
        data.push([title, `《${subject.title}》`, url, create_time, rating ? rating.value : '', type_name, fulltext]);
      });
      let worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(this.workbook, worksheet, sheetNames[type]);
    }
  }
  async exportAnnotation(storage) {
    let collection = storage.local.annotation.reverse();
    let data = [['书名', '章节', '页码', '链接', '创建时间', '我的评分', '内容']];
    await collection.each(row => {
      let {
        subject,
        chapter,
        page,
        url,
        rating,
        fulltext,
        create_time
      } = row.annotation;
      data.push([subject ? subject.title : '', chapter, page, url, create_time, rating ? rating.value : '', fulltext]);
    });
    let worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(this.workbook, worksheet, '笔记');
  }
  async exportStatus(storage) {
    let formatStatus = status => {
      if (status.deleted || status.hidden) {
        return status.msg;
      }
      let text = `${status.author.name}(@${status.author.uid})`;
      if (status.activity) {
        text += ` ${status.activity}`;
      }
      text += `: ${status.text}`;
      if (status.card) {
        text += `[推荐]:《${status.card.title}》(${status.card.url})`;
      }
      if (status.images && status.images.length > 0) {
        let images = [];
        status.images.forEach(image => {
          images.push(image.large.url);
        });
        text += ` ${images}`;
      }
      if (status.parent_status) {
        text += `//${formatStatus(status.parent_status)}...`;
      }
      if (status.reshared_status) {
        text += `//${formatStatus(status.reshared_status)}`;
      }
      return text;
    };
    let collection = await storage.local.status.orderBy('id').reverse();
    let data = [['创建时间', '链接', '内容', '话题']];
    await collection.each(row => {
      let {
        sharing_url,
        create_time,
        topic
      } = row.status;
      data.push([create_time, sharing_url, formatStatus(row.status), topic ? [topic.title, topic.url].toString() : '']);
    });
    let worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(this.workbook, worksheet, '广播');
  }
  async exportFollowing(storage) {
    let data = [['用户名', '用户ID', '链接', '所在地', '备注']];
    let versionInfo = await storage.local.table('version').get({
      table: 'following'
    });
    if (versionInfo) {
      let collection = storage.local.following.where({
        version: versionInfo.version
      });
      await collection.each(row => {
        let {
          name,
          uid,
          url,
          loc,
          remark
        } = row.user;
        data.push([name, uid, url, loc ? loc.name : '', remark]);
      });
    }
    let worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(this.workbook, worksheet, '我关注的');
  }
  async exportFollower(storage) {
    let data = [['用户名', '用户ID', '链接', '所在地']];
    let versionInfo = await storage.local.table('version').get({
      table: 'follower'
    });
    if (versionInfo) {
      let collection = storage.local.follower.where({
        version: versionInfo.version
      });
      await collection.each(row => {
        let {
          name,
          uid,
          url,
          loc
        } = row.user;
        data.push([name, uid, url, loc ? loc.name : '']);
      });
    }
    let worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(this.workbook, worksheet, '关注我的');
  }
  async exportBlacklist(storage) {
    let data = [['用户名', '用户ID', '链接']];
    let versionInfo = await storage.local.table('version').get({
      table: 'blacklist'
    });
    if (versionInfo) {
      let collection = storage.local.blacklist.where({
        version: versionInfo.version
      });
      await collection.each(row => {
        let {
          name,
          uid,
          url
        } = row.user;
        data.push([name, uid, url]);
      });
    }
    let worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(this.workbook, worksheet, '黑名单');
  }
  async exportNote(storage) {
    let collection = storage.local.note.reverse();
    let data = [['标题', '链接', '创建时间', '修改时间', '内容']];
    await collection.each(row => {
      let {
        title,
        url,
        fulltext,
        create_time,
        update_time
      } = row.note;
      data.push([title, url, create_time, update_time, fulltext]);
    });
    let worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(this.workbook, worksheet, '日记');
  }
  async exportPhoto(storage) {
    let data = [['相册名称', '相册链接', '相册描述', '相册创建时间', '照片描述', '照片链接']];
    let albums = await storage.local.album.toArray();
    for (let {
      id,
      album
    } of albums) {
      data.push([album.title, album.url, album.description, album.create_time]);
      let photos = storage.local.photo.where({
        album: id
      });
      await photos.each(photo => {
        let {
          url,
          description
        } = photo.photo;
        data.push([null, null, null, null, description, url]);
      });
    }
    let worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(this.workbook, worksheet, '相册');
  }
  async exportDoumail(storage) {
    let data = [['用户', '链接', '发件人', '发送时间', '正文']];
    let contacts = await storage.local.doumailContact.orderBy('rank').reverse().toArray();
    for (let {
      id,
      contact,
      url
    } of contacts) {
      data.push([contact.name, url]);
      let doumails = storage.local.doumail.where({
        contact: id
      });
      await doumails.each(doumail => {
        let {
          content,
          sender,
          datetime
        } = doumail;
        data.push([null, null, sender.name, datetime, content]);
      });
    }
    let worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(this.workbook, worksheet, '豆邮');
  }
  async exportDoulist(storage) {
    let sheetNames = {
      'owned': '创建的豆列',
      'following': '收藏的豆列'
    };
    for (let type in sheetNames) {
      let data = [['豆列名称', '豆列链接', '豆列简介', '豆列创建时间', '豆列更新时间', '内容名称', '内容链接', '来源', '评语']];
      let doulists = await storage.local.doulist.where({
        type: type
      }).toArray();
      for (let {
        id,
        doulist
      } of doulists) {
        data.push([doulist.title, doulist.url, doulist.desc, doulist.create_time, doulist.update_time]);
        let items = storage.local.doulistItem.where({
          doulist: id
        });
        await items.each(item => {
          let {
            url,
            title,
            source,
            comment
          } = item.item;
          data.push([null, null, null, null, null, title, url, source, comment]);
        });
      }
      let worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(this.workbook, worksheet, sheetNames[type]);
    }
  }
  async exportBoard(storage) {
    let data = [['留言用户', '用户主页', '留言时间', '消息']];
    let messages = await storage.local.board.reverse().toArray();
    for (let {
      id,
      sender,
      sendTime,
      message
    } of messages) {
      data.push([sender.name, sender.url, sendTime, message]);
    }
    let worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(this.workbook, worksheet, '留言板');
  }
  async export(items) {
    let storage = new _storage.default(this.userId);
    storage.local.open();
    for (let item of items) {
      switch (item) {
        case 'Interest':
          await this.exportInterest(storage);
          break;
        case 'Review':
          await this.exportReview(storage);
          break;
        case 'Annotation':
          await this.exportAnnotation(storage);
          break;
        case 'Status':
          await this.exportStatus(storage);
          break;
        case 'Following':
          await this.exportFollowing(storage);
          break;
        case 'Follower':
          await this.exportFollower(storage);
          break;
        case 'Blacklist':
          await this.exportBlacklist(storage);
          break;
        case 'Note':
          await this.exportNote(storage);
          break;
        case 'Photo':
          await this.exportPhoto(storage);
          break;
        case 'Doumail':
          await this.exportDoumail(storage);
          break;
        case 'Doulist':
          await this.exportDoulist(storage);
          break;
        case 'Board':
          await this.exportBoard(storage);
          break;
      }
    }
    storage.local.close();
  }
  save() {
    let filename = `豆瓣账号备份(${this.userId}).xlsx`;
    XLSX.writeFile(this.workbook, filename);
  }
}

/**
 * Class MigrateModal
 */
class MigrateModal {
  constructor(selector) {
    this.element = document.querySelector(selector);
  }
  static init() {
    let modal = new MigrateModal('#migrate-modal');
    modal.element.querySelectorAll('.cancel').forEach(item => {
      item.addEventListener('click', () => modal.close());
    });
    $('.button[name="migrate"]').click(() => modal.open());
    modal.element.querySelector('.select-all').addEventListener('change', event => {
      modal.element.querySelectorAll('input[name="task"]').forEach(item => {
        if (!item.hasAttribute('disabled')) {
          item.checked = event.target.checked;
        }
      });
    });
    modal.element.querySelector('.button[name="migrate"]').addEventListener('click', async () => {
      let localUserId = parseInt(location.search.substr(1));
      let job = await modal.createJob(localUserId);
      if (job) {
        modal.close();
        window.open(chrome.extension.getURL('options.html#service'));
      }
    });
    return modal;
  }
  async createJob(localUserId) {
    let service = (await new Promise(resolve => {
      chrome.runtime.getBackgroundPage(resolve);
    })).service;
    let checkedTasks = this.element.querySelectorAll('input[name="task"]:checked');
    if (checkedTasks.length == 0) {
      alert('请勾选要迁移的项目。');
      return null;
    }
    let tasks = new Array(checkedTasks.length);
    for (let i = 0; i < checkedTasks.length; i++) {
      tasks[i] = {
        name: 'migrate/' + checkedTasks[i].value
      };
    }
    let job = await service.createJob(null, localUserId, tasks);
    return job;
  }
  open() {
    this.element.classList.add('is-active');
  }
  close() {
    this.element.classList.remove('is-active');
  }
}
let tab = _tab.default.render();
tab.addEventListener('toggle', async event => await Panel.render(event.target.activeTab));
Panel.render(tab.activeTab);
ExportModal.init();
MigrateModal.init();
document.querySelector('.button[name="upload"]').addEventListener('click', async () => {
  let localUserId = parseInt(location.search.substr(1));
  let service = (await new Promise(resolve => {
    chrome.runtime.getBackgroundPage(resolve);
  })).service;
  let job = await service.createJob(localUserId, null, [{
    name: 'files'
  }], true);
  if (job) {
    window.open(chrome.extension.getURL('options.html#service'));
  }
});

},{"./storage.js":4,"./ui/paginator.js":5,"./ui/tab.js":6}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dexie = _interopRequireDefault(require("./vendor/dexie.js"));
var _IDBExportImport = require("./vendor/IDBExportImport.js");
var fflate = _interopRequireWildcard(require("./vendor/fflate.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const DB_NAME = 'tofu';
const SCHEMA_GLOBAL = [null, {
  account: 'userId, userSymbol',
  job: '++id, userId, userSymbol'
}];
const SCHEMA_LOCAL = [null, {
  status: 'id',
  following: '++id, version',
  follower: '++id, version',
  blacklist: '++id, version',
  review: 'id, type, [type+version]',
  note: 'id, version',
  interest: 'id, &subject, [type+status], [type+status+version]',
  album: 'id, version',
  photo: 'id, album, [album+version]',
  doulist: 'id, type, [type+version]',
  doulistItem: 'id, doulist, [doulist+version]',
  doumail: 'id, contact',
  doumailContact: 'id, rank',
  version: 'table, version'
}, {
  files: '++id, &url'
}, {
  annotation: 'id, subject, [subject+version]'
}, {
  board: 'id'
}];

/**
 * Class Storage
 */
class Storage {
  constructor(userId = null) {
    this.userId = userId;
  }
  get global() {
    if (!this._global) {
      let db = this._global = new _dexie.default(DB_NAME);
      for (let i = 1; i < SCHEMA_GLOBAL.length; i++) {
        db.version(i).stores(SCHEMA_GLOBAL[i]);
      }
    }
    return this._global;
  }
  get local() {
    if (!this._local) {
      if (!this.userId) {
        throw new Error('No local storage');
      }
      this._local = this.getLocalDb(this.userId);
    }
    return this._local;
  }
  getLocalDb(userId) {
    let db = new _dexie.default(`${DB_NAME}[${userId}]`);
    for (let i = 1; i < SCHEMA_LOCAL.length; i++) {
      db.version(i).stores(SCHEMA_LOCAL[i]);
    }
    return db;
  }
  async drop(userId) {
    let localDbName = `${DB_NAME}[${userId}]`;
    if (await _dexie.default.exists(localDbName)) {
      try {
        await _dexie.default.delete(localDbName);
      } catch (e) {
        return false;
      }
    }
    return (await this.global.account.where({
      userId: parseInt(userId)
    }).delete()) > 0;
  }
  async dropAll() {
    const databases = await _dexie.default.getDatabaseNames();
    for (var dbname of databases) await _dexie.default.delete(dbname);
    return true;
  }
  async exists() {
    const databases = await _dexie.default.getDatabaseNames();
    return databases.length > 0;
  }
  async dump(onProgress) {
    if (this.constructor.isRestoring) {
      throw '正在恢复数据库';
    }
    if (this.constructor.isDumping) {
      throw '正在备份数据库';
    }
    this.constructor.isDumping = true;
    try {
      var backupData = {};
      var dbFiles = [];
      const databases = await _dexie.default.getDatabaseNames();
      const total = databases.length;
      var completed = 1;
      for (let database of databases) {
        if (database != DB_NAME) {
          dbFiles.push(database);
        }
        let db = new _dexie.default(database);
        await db.open();
        let dbJson = await new Promise((resolve, reject) => {
          (0, _IDBExportImport.exportToJsonString)(db.backendDB(), (error, jsonString) => {
            if (error) {
              reject(error);
            } else {
              resolve(jsonString);
            }
          });
        });
        db.close();
        backupData[database + '.json'] = fflate.strToU8(dbJson);
      }
      backupData['database.json'] = fflate.strToU8(JSON.stringify({
        'global': {
          'version': SCHEMA_GLOBAL.length
        },
        'local': {
          'version': SCHEMA_LOCAL.length,
          'files': dbFiles
        }
      }));
      return await new Promise((resolve, reject) => {
        fflate.zip(backupData, (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });
    } finally {
      this.constructor.isDumping = false;
    }
  }
  async restore() {
    if (this.constructor.isRestoring) {
      throw '正在恢复数据库';
    }
    if (this.constructor.isDumping) {
      throw '正在备份数据库';
    }
    this.constructor.isRestoring = true;
    try {
      var successes = [];
      var failures = [];
      let dbMeta = window.tofu['database'];
      if (dbMeta.global.version != SCHEMA_GLOBAL.length || dbMeta.local.version != SCHEMA_LOCAL.length) {
        throw '数据库版本不一致';
      }
      ;
      var completed = 1;
      const total = dbMeta.local.files.length + 2;
      let globalDb = window.tofu[`${DB_NAME}`];
      await this.global.open();
      try {
        for (let account of globalDb.account) {
          let dbName = `${DB_NAME}[${account.userId}]`;
          if (await this.global.account.get({
            userId: account.userId
          })) {
            failures.push({
              'database': dbName,
              'error': '数据库已存在'
            });
            continue;
          }
          let localDb = this.getLocalDb(account.userId);
          await localDb.open();
          try {
            await new Promise((resolve, reject) => {
              (0, _IDBExportImport.importFromJsonString)(localDb.backendDB(), JSON.stringify(window.tofu[dbName]), error => {
                if (error) {
                  reject(error);
                } else {
                  resolve();
                }
              });
            });
            await this.global.account.put(account);
            successes.push({
              'database': dbName
            });
          } catch (error) {
            failures.push({
              'database': dbName,
              'error': error
            });
          } finally {
            localDb.close();
          }
        }
      } finally {
        this.global.close();
      }
      return {
        'successes': successes,
        'failures': failures
      };
    } finally {
      this.constructor.isRestoring = false;
    }
  }
}
exports.default = Storage;

},{"./vendor/IDBExportImport.js":7,"./vendor/dexie.js":8,"./vendor/fflate.js":9}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const TEMPLATE_PAGINATOR = `\
<nav class="pagination is-centered" role="navigation">
  <a class="pagination-previous">上一页</a>
  <a class="pagination-next">下一页</a>
  <ul class="pagination-list"></ul>
</nav>`;
const TEMPLATE_GOTO = `\
<li>
    <div class="field has-addons" style="margin: 0.25rem;">
        <div class="control">
            <input class="input pagination-goto" type="text" size="1">
        </div>
        <div class="control">
            <a class="button pagination-goto">跳转</a>
        </div>
    </div>
</li>`;

/**
 * Class Paginator
 */
class Paginator extends EventTarget {
  constructor(currentPage, pageCount, padding = 6) {
    super();
    this.currentPage = currentPage;
    this.pageCount = pageCount;
    this.padding = padding;
    this.load();
  }
  load() {
    let currentPage = this.currentPage;
    let pageCount = this.pageCount;
    let padding = this.padding;
    let $pagination = this.$pagination = $(TEMPLATE_PAGINATOR);
    let relativeBeginPage = pageCount - parseInt(padding / 2) > currentPage ? currentPage - parseInt(Math.floor((padding - 1) / 2)) : pageCount - padding + 1;
    let beginPage = relativeBeginPage > 0 ? relativeBeginPage : 1;
    let relativeEndPage = beginPage + padding - 1;
    let endPage = relativeEndPage < pageCount ? relativeEndPage : pageCount;
    let $paginationList = $pagination.find('.pagination-list');
    $paginationList.html('');
    if (currentPage == 1) {
      $pagination.find('.pagination-previous').attr('disabled', 'disabled');
      $paginationList.append('<li><a class="pagination-link is-current">1</a></li>');
    } else {
      $paginationList.append('<li><a class="pagination-link">1</a></li>');
    }
    if (beginPage > 2) {
      $paginationList.append('<li><span class="pagination-ellipsis">&hellip;</span></li>');
    }
    for (let i = beginPage + 1; i < endPage; i++) {
      if (i == currentPage) {
        $paginationList.append('<li><a class="pagination-link is-current">' + i + '</a></li>');
      } else {
        $paginationList.append('<li><a class="pagination-link">' + i + '</a></li>');
      }
    }
    if (endPage <= pageCount - 1) {
      $paginationList.append('<li><span class="pagination-ellipsis">&hellip;</span></li>');
    }
    if (currentPage == pageCount) {
      $pagination.find('.pagination-next').attr('disabled', 'disabled');
      pageCount > 1 && $paginationList.append('<li><a class="pagination-link is-current">' + pageCount + '</a></li>');
    } else {
      pageCount > 1 && $paginationList.append('<li><a class="pagination-link">' + pageCount + '</a></li>');
    }
    $paginationList.append(TEMPLATE_GOTO);
    $pagination.on('click', '.pagination-link', event => {
      this.currentPage = parseInt(event.currentTarget.innerText);
      this.dispatchEvent(new Event('change'));
    });
    $pagination.on('click', '.pagination-previous', event => {
      let currentPage = parseInt($pagination.find('.pagination-link.is-current').text());
      if (isNaN(currentPage) || currentPage == 1) return false;
      this.currentPage = currentPage - 1;
      this.dispatchEvent(new Event('change'));
    });
    $pagination.on('click', '.pagination-next', event => {
      let currentPage = parseInt($pagination.find('.pagination-link.is-current').text());
      if (isNaN(currentPage) || currentPage == endPage) return false;
      this.currentPage = currentPage + 1;
      this.dispatchEvent(new Event('change'));
    });
    $pagination.on('click', '.button.pagination-goto', event => {
      let currentPage = parseInt($pagination.find('.input.pagination-goto').val());
      if (isNaN(currentPage) || currentPage < 1 || currentPage > pageCount) return false;
      this.currentPage = currentPage;
      this.dispatchEvent(new Event('change'));
    });
  }
  appendTo(node) {
    this.$pagination.appendTo(node);
  }
}
exports.default = Paginator;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Class Notification
 */
class TabPanel extends EventTarget {
  constructor(tabSelector, contentSelector) {
    super();
    let $tabs = this.$tabs = $(tabSelector);
    this.$contents = $(contentSelector);
    window.addEventListener('hashchange', e => {
      if (location.hash) {
        this.toggle(location.hash.substr(1));
      }
    }, false);
    if (location.hash) {
      this.toggle(location.hash.substr(1));
    } else {
      for (let i = 0; i < $tabs.length; i++) {
        let tab = $tabs[i];
        if (tab.classList.contains('is-active')) {
          this.toggle(tab.dataset.tab, tab);
          break;
        }
      }
    }
  }
  get activeTab() {
    return this._activeTab;
  }
  toggle(tabName, tab) {
    if (!tab) {
      tab = this.$tabs.find('[href="#' + tabName + '"]').parent('li')[0];
    }
    this.$tabs.removeClass('is-active');
    this.$contents.addClass('is-hidden');
    tab.classList.add('is-active');
    this.$contents.each((_, el) => {
      if (el.getAttribute('name') == tabName) {
        this._activeTab = el;
        el.classList.remove('is-hidden');
      }
    });
    this.dispatchEvent(new Event('toggle'));
  }
  static render() {
    return new TabPanel('.page-tab-link', '.page-tab-content');
  }
}
exports.default = TabPanel;

},{}],7:[function(require,module,exports){
'use strict';

/**
 * Export all data from an IndexedDB database
 * @param {IDBDatabase} idbDatabase - to export from
 * @param {function(Object?, string?)} cb - callback with signature (error, jsonString)
 */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearDatabase = clearDatabase;
exports.exportToJsonString = exportToJsonString;
exports.importFromJsonString = importFromJsonString;
function exportToJsonString(idbDatabase, cb) {
  const exportObject = {};
  const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
  const size = objectStoreNamesSet.size;
  if (size === 0) {
    cb(null, JSON.stringify(exportObject));
  } else {
    const objectStoreNames = Array.from(objectStoreNamesSet);
    const transaction = idbDatabase.transaction(objectStoreNames, 'readonly');
    transaction.onerror = event => cb(event, null);
    objectStoreNames.forEach(storeName => {
      const allObjects = [];
      transaction.objectStore(storeName).openCursor().onsuccess = event => {
        const cursor = event.target.result;
        if (cursor) {
          allObjects.push(cursor.value);
          cursor.continue();
        } else {
          exportObject[storeName] = allObjects;
          if (objectStoreNames.length === Object.keys(exportObject).length) {
            cb(null, JSON.stringify(exportObject));
          }
        }
      };
    });
  }
}

/**
 * Import data from JSON into an IndexedDB database. This does not delete any existing data
 *  from the database, so keys could clash.
 *
 * Only object stores that already exist will be imported.
 *
 * @param {IDBDatabase} idbDatabase - to import into
 * @param {string} jsonString - data to import, one key per object store
 * @param {function(Object)} cb - callback with signature (error), where error is null on success
 * @return {void}
 */
function importFromJsonString(idbDatabase, jsonString, cb) {
  const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
  const size = objectStoreNamesSet.size;
  if (size === 0) {
    cb(null);
  } else {
    const objectStoreNames = Array.from(objectStoreNamesSet);
    const transaction = idbDatabase.transaction(objectStoreNames, 'readwrite');
    transaction.onerror = event => cb(event);
    const importObject = JSON.parse(jsonString);

    // Delete keys present in JSON that are not present in database
    Object.keys(importObject).forEach(storeName => {
      if (!objectStoreNames.includes(storeName)) {
        delete importObject[storeName];
      }
    });
    if (Object.keys(importObject).length === 0) {
      // no object stores exist to import for
      cb(null);
    }
    objectStoreNames.forEach(storeName => {
      let count = 0;
      const aux = Array.from(importObject[storeName]);
      if (importObject[storeName] && aux.length > 0) {
        aux.forEach(toAdd => {
          const request = transaction.objectStore(storeName).add(toAdd);
          request.onsuccess = () => {
            count++;
            if (count === importObject[storeName].length) {
              // added all objects for this store
              delete importObject[storeName];
              if (Object.keys(importObject).length === 0) {
                // added all object stores
                cb(null);
              }
            }
          };
          request.onerror = event => {
            console.log(event);
          };
        });
      } else {
        delete importObject[storeName];
        if (Object.keys(importObject).length === 0) {
          // added all object stores
          cb(null);
        }
      }
    });
  }
}

/**
 * Clears a database of all data.
 *
 * The object stores will still exist but will be empty.
 *
 * @param {IDBDatabase} idbDatabase - to delete all data from
 * @param {function(Object)} cb - callback with signature (error), where error is null on success
 * @return {void}
 */
function clearDatabase(idbDatabase, cb) {
  const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
  const size = objectStoreNamesSet.size;
  if (size === 0) {
    cb(null);
  } else {
    const objectStoreNames = Array.from(objectStoreNamesSet);
    const transaction = idbDatabase.transaction(objectStoreNames, 'readwrite');
    transaction.onerror = event => cb(event);
    let count = 0;
    objectStoreNames.forEach(function (storeName) {
      transaction.objectStore(storeName).clear().onsuccess = () => {
        count++;
        if (count === size) {
          // cleared all object stores
          cb(null);
        }
      };
    });
  }
}

},{}],8:[function(require,module,exports){
(function (global,setImmediate){(function (){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/*
 * Dexie.js - a minimalistic wrapper for IndexedDB
 * ===============================================
 *
 * By David Fahlander, david.fahlander@gmail.com
 *
 * Version {version}, {date}
 *
 * http://dexie.org
 *
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
 */

var keys = Object.keys;
var isArray = Array.isArray;
var _global = typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : global;
function extend(obj, extension) {
  if (typeof extension !== 'object') return obj;
  keys(extension).forEach(function (key) {
    obj[key] = extension[key];
  });
  return obj;
}
var getProto = Object.getPrototypeOf;
var _hasOwn = {}.hasOwnProperty;
function hasOwn(obj, prop) {
  return _hasOwn.call(obj, prop);
}
function props(proto, extension) {
  if (typeof extension === 'function') extension = extension(getProto(proto));
  keys(extension).forEach(function (key) {
    setProp(proto, key, extension[key]);
  });
}
var defineProperty = Object.defineProperty;
function setProp(obj, prop, functionOrGetSet, options) {
  defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ? {
    get: functionOrGetSet.get,
    set: functionOrGetSet.set,
    configurable: true
  } : {
    value: functionOrGetSet,
    configurable: true,
    writable: true
  }, options));
}
function derive(Child) {
  return {
    from: function (Parent) {
      Child.prototype = Object.create(Parent.prototype);
      setProp(Child.prototype, "constructor", Child);
      return {
        extend: props.bind(null, Child.prototype)
      };
    }
  };
}
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
function getPropertyDescriptor(obj, prop) {
  var pd = getOwnPropertyDescriptor(obj, prop),
    proto;
  return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
}
var _slice = [].slice;
function slice(args, start, end) {
  return _slice.call(args, start, end);
}
function override(origFunc, overridedFactory) {
  return overridedFactory(origFunc);
}
function assert(b) {
  if (!b) throw new Error("Assertion Failed");
}
function asap(fn) {
  if (_global.setImmediate) setImmediate(fn);else setTimeout(fn, 0);
}

/** Generate an object (hash map) based on given array.
 * @param extractor Function taking an array item and its index and returning an array of 2 items ([key, value]) to
 *        instert on the resulting object for each item in the array. If this function returns a falsy value, the
 *        current item wont affect the resulting object.
 */
function arrayToObject(array, extractor) {
  return array.reduce(function (result, item, i) {
    var nameAndValue = extractor(item, i);
    if (nameAndValue) result[nameAndValue[0]] = nameAndValue[1];
    return result;
  }, {});
}
function trycatcher(fn, reject) {
  return function () {
    try {
      fn.apply(this, arguments);
    } catch (e) {
      reject(e);
    }
  };
}
function tryCatch(fn, onerror, args) {
  try {
    fn.apply(null, args);
  } catch (ex) {
    onerror && onerror(ex);
  }
}
function getByKeyPath(obj, keyPath) {
  // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
  if (hasOwn(obj, keyPath)) return obj[keyPath]; // This line is moved from last to first for optimization purpose.
  if (!keyPath) return obj;
  if (typeof keyPath !== 'string') {
    var rv = [];
    for (var i = 0, l = keyPath.length; i < l; ++i) {
      var val = getByKeyPath(obj, keyPath[i]);
      rv.push(val);
    }
    return rv;
  }
  var period = keyPath.indexOf('.');
  if (period !== -1) {
    var innerObj = obj[keyPath.substr(0, period)];
    return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
  }
  return undefined;
}
function setByKeyPath(obj, keyPath, value) {
  if (!obj || keyPath === undefined) return;
  if ('isFrozen' in Object && Object.isFrozen(obj)) return;
  if (typeof keyPath !== 'string' && 'length' in keyPath) {
    assert(typeof value !== 'string' && 'length' in value);
    for (var i = 0, l = keyPath.length; i < l; ++i) {
      setByKeyPath(obj, keyPath[i], value[i]);
    }
  } else {
    var period = keyPath.indexOf('.');
    if (period !== -1) {
      var currentKeyPath = keyPath.substr(0, period);
      var remainingKeyPath = keyPath.substr(period + 1);
      if (remainingKeyPath === "") {
        if (value === undefined) delete obj[currentKeyPath];else obj[currentKeyPath] = value;
      } else {
        var innerObj = obj[currentKeyPath];
        if (!innerObj) innerObj = obj[currentKeyPath] = {};
        setByKeyPath(innerObj, remainingKeyPath, value);
      }
    } else {
      if (value === undefined) delete obj[keyPath];else obj[keyPath] = value;
    }
  }
}
function delByKeyPath(obj, keyPath) {
  if (typeof keyPath === 'string') setByKeyPath(obj, keyPath, undefined);else if ('length' in keyPath) [].map.call(keyPath, function (kp) {
    setByKeyPath(obj, kp, undefined);
  });
}
function shallowClone(obj) {
  var rv = {};
  for (var m in obj) {
    if (hasOwn(obj, m)) rv[m] = obj[m];
  }
  return rv;
}
var concat = [].concat;
function flatten(a) {
  return concat.apply([], a);
}
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
var intrinsicTypes = "Boolean,String,Date,RegExp,Blob,File,FileList,ArrayBuffer,DataView,Uint8ClampedArray,ImageData,Map,Set".split(',').concat(flatten([8, 16, 32, 64].map(function (num) {
  return ["Int", "Uint", "Float"].map(function (t) {
    return t + num + "Array";
  });
}))).filter(function (t) {
  return _global[t];
}).map(function (t) {
  return _global[t];
});
function deepClone(any) {
  if (!any || typeof any !== 'object') return any;
  var rv;
  if (isArray(any)) {
    rv = [];
    for (var i = 0, l = any.length; i < l; ++i) {
      rv.push(deepClone(any[i]));
    }
  } else if (intrinsicTypes.indexOf(any.constructor) >= 0) {
    rv = any;
  } else {
    rv = any.constructor ? Object.create(any.constructor.prototype) : {};
    for (var prop in any) {
      if (hasOwn(any, prop)) {
        rv[prop] = deepClone(any[prop]);
      }
    }
  }
  return rv;
}
function getObjectDiff(a, b, rv, prfx) {
  // Compares objects a and b and produces a diff object.
  rv = rv || {};
  prfx = prfx || '';
  keys(a).forEach(function (prop) {
    if (!hasOwn(b, prop)) rv[prfx + prop] = undefined; // Property removed
    else {
      var ap = a[prop],
        bp = b[prop];
      if (typeof ap === 'object' && typeof bp === 'object' && ap && bp &&
      // Now compare constructors are same (not equal because wont work in Safari)
      '' + ap.constructor === '' + bp.constructor)
        // Same type of object but its properties may have changed
        getObjectDiff(ap, bp, rv, prfx + prop + ".");else if (ap !== bp) rv[prfx + prop] = b[prop]; // Primitive value changed
    }
  });

  keys(b).forEach(function (prop) {
    if (!hasOwn(a, prop)) {
      rv[prfx + prop] = b[prop]; // Property added
    }
  });

  return rv;
}
// If first argument is iterable or array-like, return it as an array
var iteratorSymbol = typeof Symbol !== 'undefined' && Symbol.iterator;
var getIteratorOf = iteratorSymbol ? function (x) {
  var i;
  return x != null && (i = x[iteratorSymbol]) && i.apply(x);
} : function () {
  return null;
};
var NO_CHAR_ARRAY = {};
// Takes one or several arguments and returns an array based on the following criteras:
// * If several arguments provided, return arguments converted to an array in a way that
//   still allows javascript engine to optimize the code.
// * If single argument is an array, return a clone of it.
// * If this-pointer equals NO_CHAR_ARRAY, don't accept strings as valid iterables as a special
//   case to the two bullets below.
// * If single argument is an iterable, convert it to an array and return the resulting array.
// * If single argument is array-like (has length of type number), convert it to an array.
function getArrayOf(arrayLike) {
  var i, a, x, it;
  if (arguments.length === 1) {
    if (isArray(arrayLike)) return arrayLike.slice();
    if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string') return [arrayLike];
    if (it = getIteratorOf(arrayLike)) {
      a = [];
      while (x = it.next(), !x.done) a.push(x.value);
      return a;
    }
    if (arrayLike == null) return [arrayLike];
    i = arrayLike.length;
    if (typeof i === 'number') {
      a = new Array(i);
      while (i--) a[i] = arrayLike[i];
      return a;
    }
    return [arrayLike];
  }
  i = arguments.length;
  a = new Array(i);
  while (i--) a[i] = arguments[i];
  return a;
}

// By default, debug will be true only if platform is a web platform and its page is served from localhost.
// When debug = true, error's stacks will contain asyncronic long stacks.
var debug = typeof location !== 'undefined' &&
// By default, use debug mode if served from localhost.
/^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
function setDebug(value, filter) {
  debug = value;
  libraryFilter = filter;
}
var libraryFilter = function () {
  return true;
};
var NEEDS_THROW_FOR_STACK = !new Error("").stack;
function getErrorWithStack() {
  "use strict";

  if (NEEDS_THROW_FOR_STACK) try {
    // Doing something naughty in strict mode here to trigger a specific error
    // that can be explicitely ignored in debugger's exception settings.
    // If we'd just throw new Error() here, IE's debugger's exception settings
    // will just consider it as "exception thrown by javascript code" which is
    // something you wouldn't want it to ignore.
    getErrorWithStack.arguments;
    throw new Error(); // Fallback if above line don't throw.
  } catch (e) {
    return e;
  }
  return new Error();
}
function prettyStack(exception, numIgnoredFrames) {
  var stack = exception.stack;
  if (!stack) return "";
  numIgnoredFrames = numIgnoredFrames || 0;
  if (stack.indexOf(exception.name) === 0) numIgnoredFrames += (exception.name + exception.message).split('\n').length;
  return stack.split('\n').slice(numIgnoredFrames).filter(libraryFilter).map(function (frame) {
    return "\n" + frame;
  }).join('');
}
function deprecated(what, fn) {
  return function () {
    console.warn(what + " is deprecated. See https://github.com/dfahlander/Dexie.js/wiki/Deprecations. " + prettyStack(getErrorWithStack(), 1));
    return fn.apply(this, arguments);
  };
}
var dexieErrorNames = ['Modify', 'Bulk', 'OpenFailed', 'VersionChange', 'Schema', 'Upgrade', 'InvalidTable', 'MissingAPI', 'NoSuchDatabase', 'InvalidArgument', 'SubTransaction', 'Unsupported', 'Internal', 'DatabaseClosed', 'PrematureCommit', 'ForeignAwait'];
var idbDomErrorNames = ['Unknown', 'Constraint', 'Data', 'TransactionInactive', 'ReadOnly', 'Version', 'NotFound', 'InvalidState', 'InvalidAccess', 'Abort', 'Timeout', 'QuotaExceeded', 'Syntax', 'DataClone'];
var errorList = dexieErrorNames.concat(idbDomErrorNames);
var defaultTexts = {
  VersionChanged: "Database version changed by other database connection",
  DatabaseClosed: "Database has been closed",
  Abort: "Transaction aborted",
  TransactionInactive: "Transaction has already completed or failed"
};
//
// DexieError - base class of all out exceptions.
//
function DexieError(name, msg) {
  // Reason we don't use ES6 classes is because:
  // 1. It bloats transpiled code and increases size of minified code.
  // 2. It doesn't give us much in this case.
  // 3. It would require sub classes to call super(), which
  //    is not needed when deriving from Error.
  this._e = getErrorWithStack();
  this.name = name;
  this.message = msg;
}
derive(DexieError).from(Error).extend({
  stack: {
    get: function () {
      return this._stack || (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
    }
  },
  toString: function () {
    return this.name + ": " + this.message;
  }
});
function getMultiErrorMessage(msg, failures) {
  return msg + ". Errors: " + failures.map(function (f) {
    return f.toString();
  }).filter(function (v, i, s) {
    return s.indexOf(v) === i;
  }) // Only unique error strings
  .join('\n');
}
//
// ModifyError - thrown in Collection.modify()
// Specific constructor because it contains members failures and failedKeys.
//
function ModifyError(msg, failures, successCount, failedKeys) {
  this._e = getErrorWithStack();
  this.failures = failures;
  this.failedKeys = failedKeys;
  this.successCount = successCount;
}
derive(ModifyError).from(DexieError);
function BulkError(msg, failures) {
  this._e = getErrorWithStack();
  this.name = "BulkError";
  this.failures = failures;
  this.message = getMultiErrorMessage(msg, failures);
}
derive(BulkError).from(DexieError);
//
//
// Dynamically generate error names and exception classes based
// on the names in errorList.
//
//
// Map of {ErrorName -> ErrorName + "Error"}
var errnames = errorList.reduce(function (obj, name) {
  return obj[name] = name + "Error", obj;
}, {});
// Need an alias for DexieError because we're gonna create subclasses with the same name.
var BaseException = DexieError;
// Map of {ErrorName -> exception constructor}
var exceptions = errorList.reduce(function (obj, name) {
  // Let the name be "DexieError" because this name may
  // be shown in call stack and when debugging. DexieError is
  // the most true name because it derives from DexieError,
  // and we cannot change Function.name programatically without
  // dynamically create a Function object, which would be considered
  // 'eval-evil'.
  var fullName = name + "Error";
  function DexieError(msgOrInner, inner) {
    this._e = getErrorWithStack();
    this.name = fullName;
    if (!msgOrInner) {
      this.message = defaultTexts[name] || fullName;
      this.inner = null;
    } else if (typeof msgOrInner === 'string') {
      this.message = msgOrInner;
      this.inner = inner || null;
    } else if (typeof msgOrInner === 'object') {
      this.message = msgOrInner.name + " " + msgOrInner.message;
      this.inner = msgOrInner;
    }
  }
  derive(DexieError).from(BaseException);
  obj[name] = DexieError;
  return obj;
}, {});
// Use ECMASCRIPT standard exceptions where applicable:
exceptions.Syntax = SyntaxError;
exceptions.Type = TypeError;
exceptions.Range = RangeError;
var exceptionMap = idbDomErrorNames.reduce(function (obj, name) {
  obj[name + "Error"] = exceptions[name];
  return obj;
}, {});
function mapError(domError, message) {
  if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name]) return domError;
  var rv = new exceptionMap[domError.name](message || domError.message, domError);
  if ("stack" in domError) {
    // Derive stack from inner exception if it has a stack
    setProp(rv, "stack", {
      get: function () {
        return this.inner.stack;
      }
    });
  }
  return rv;
}
var fullNameExceptions = errorList.reduce(function (obj, name) {
  if (["Syntax", "Type", "Range"].indexOf(name) === -1) obj[name + "Error"] = exceptions[name];
  return obj;
}, {});
fullNameExceptions.ModifyError = ModifyError;
fullNameExceptions.DexieError = DexieError;
fullNameExceptions.BulkError = BulkError;
function nop() {}
function mirror(val) {
  return val;
}
function pureFunctionChain(f1, f2) {
  // Enables chained events that takes ONE argument and returns it to the next function in chain.
  // This pattern is used in the hook("reading") event.
  if (f1 == null || f1 === mirror) return f2;
  return function (val) {
    return f2(f1(val));
  };
}
function callBoth(on1, on2) {
  return function () {
    on1.apply(this, arguments);
    on2.apply(this, arguments);
  };
}
function hookCreatingChain(f1, f2) {
  // Enables chained events that takes several arguments and may modify first argument by making a modification and then returning the same instance.
  // This pattern is used in the hook("creating") event.
  if (f1 === nop) return f2;
  return function () {
    var res = f1.apply(this, arguments);
    if (res !== undefined) arguments[0] = res;
    var onsuccess = this.onsuccess,
      // In case event listener has set this.onsuccess
      onerror = this.onerror; // In case event listener has set this.onerror
    this.onsuccess = null;
    this.onerror = null;
    var res2 = f2.apply(this, arguments);
    if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
    if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
    return res2 !== undefined ? res2 : res;
  };
}
function hookDeletingChain(f1, f2) {
  if (f1 === nop) return f2;
  return function () {
    f1.apply(this, arguments);
    var onsuccess = this.onsuccess,
      // In case event listener has set this.onsuccess
      onerror = this.onerror; // In case event listener has set this.onerror
    this.onsuccess = this.onerror = null;
    f2.apply(this, arguments);
    if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
    if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
  };
}
function hookUpdatingChain(f1, f2) {
  if (f1 === nop) return f2;
  return function (modifications) {
    var res = f1.apply(this, arguments);
    extend(modifications, res); // If f1 returns new modifications, extend caller's modifications with the result before calling next in chain.
    var onsuccess = this.onsuccess,
      // In case event listener has set this.onsuccess
      onerror = this.onerror; // In case event listener has set this.onerror
    this.onsuccess = null;
    this.onerror = null;
    var res2 = f2.apply(this, arguments);
    if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
    if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
    return res === undefined ? res2 === undefined ? undefined : res2 : extend(res, res2);
  };
}
function reverseStoppableEventChain(f1, f2) {
  if (f1 === nop) return f2;
  return function () {
    if (f2.apply(this, arguments) === false) return false;
    return f1.apply(this, arguments);
  };
}
function promisableChain(f1, f2) {
  if (f1 === nop) return f2;
  return function () {
    var res = f1.apply(this, arguments);
    if (res && typeof res.then === 'function') {
      var thiz = this,
        i = arguments.length,
        args = new Array(i);
      while (i--) args[i] = arguments[i];
      return res.then(function () {
        return f2.apply(thiz, args);
      });
    }
    return f2.apply(this, arguments);
  };
}

/*
 * Copyright (c) 2014-2017 David Fahlander
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/LICENSE-2.0
 */
//
// Promise and Zone (PSD) for Dexie library
//
// I started out writing this Promise class by copying promise-light (https://github.com/taylorhakes/promise-light) by
// https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
//
// In previous versions this was fixed by not calling setTimeout when knowing that the resolve() or reject() came from another
// tick. In Dexie v1.4.0, I've rewritten the Promise class entirely. Just some fragments of promise-light is left. I use
// another strategy now that simplifies everything a lot: to always execute callbacks in a new micro-task, but have an own micro-task
// engine that is indexedDB compliant across all browsers.
// Promise class has also been optimized a lot with inspiration from bluebird - to avoid closures as much as possible.
// Also with inspiration from bluebird, asyncronic stacks in debug mode.
//
// Specific non-standard features of this Promise class:
// * Custom zone support (a.k.a. PSD) with ability to keep zones also when using native promises as well as
//   native async / await.
// * Promise.follow() method built upon the custom zone engine, that allows user to track all promises created from current stack frame
//   and below + all promises that those promises creates or awaits.
// * Detect any unhandled promise in a PSD-scope (PSD.onunhandled). 
//
// David Fahlander, https://github.com/dfahlander
//
// Just a pointer that only this module knows about.
// Used in Promise constructor to emulate a private constructor.
var INTERNAL = {};
// Async stacks (long stacks) must not grow infinitely.
var LONG_STACKS_CLIP_LIMIT = 100;
var MAX_LONG_STACKS = 20;
var ZONE_ECHO_LIMIT = 7;
var nativePromiseInstanceAndProto = function () {
  try {
    // Be able to patch native async functions
    return new Function("let F=async ()=>{},p=F();return [p,Object.getPrototypeOf(p),Promise.resolve(),F.constructor];")();
  } catch (e) {
    var P = _global.Promise;
    return P ? [P.resolve(), P.prototype, P.resolve()] : [];
  }
}();
var resolvedNativePromise = nativePromiseInstanceAndProto[0];
var nativePromiseProto = nativePromiseInstanceAndProto[1];
var resolvedGlobalPromise = nativePromiseInstanceAndProto[2];
var nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
var AsyncFunction = nativePromiseInstanceAndProto[3];
var patchGlobalPromise = !!resolvedGlobalPromise;
var stack_being_generated = false;
/* The default function used only for the very first promise in a promise chain.
   As soon as then promise is resolved or rejected, all next tasks will be executed in micro ticks
   emulated in this module. For indexedDB compatibility, this means that every method needs to
   execute at least one promise before doing an indexedDB operation. Dexie will always call
   db.ready().then() for every operation to make sure the indexedDB event is started in an
   indexedDB-compatible emulated micro task loop.
*/
var schedulePhysicalTick = resolvedGlobalPromise ? function () {
  resolvedGlobalPromise.then(physicalTick);
} : _global.setImmediate ?
// setImmediate supported. Those modern platforms also supports Function.bind().
setImmediate.bind(null, physicalTick) : _global.MutationObserver ?
// MutationObserver supported
function () {
  var hiddenDiv = document.createElement("div");
  new MutationObserver(function () {
    physicalTick();
    hiddenDiv = null;
  }).observe(hiddenDiv, {
    attributes: true
  });
  hiddenDiv.setAttribute('i', '1');
} :
// No support for setImmediate or MutationObserver. No worry, setTimeout is only called
// once time. Every tick that follows will be our emulated micro tick.
// Could have uses setTimeout.bind(null, 0, physicalTick) if it wasnt for that FF13 and below has a bug 
function () {
  setTimeout(physicalTick, 0);
};
// Configurable through Promise.scheduler.
// Don't export because it would be unsafe to let unknown
// code call it unless they do try..catch within their callback.
// This function can be retrieved through getter of Promise.scheduler though,
// but users must not do Promise.scheduler = myFuncThatThrowsException
var asap$1 = function (callback, args) {
  microtickQueue.push([callback, args]);
  if (needsNewPhysicalTick) {
    schedulePhysicalTick();
    needsNewPhysicalTick = false;
  }
};
var isOutsideMicroTick = true;
var needsNewPhysicalTick = true;
var unhandledErrors = [];
var rejectingErrors = [];
var currentFulfiller = null;
var rejectionMapper = mirror; // Remove in next major when removing error mapping of DOMErrors and DOMExceptions
var globalPSD = {
  id: 'global',
  global: true,
  ref: 0,
  unhandleds: [],
  onunhandled: globalError,
  pgp: false,
  env: {},
  finalize: function () {
    this.unhandleds.forEach(function (uh) {
      try {
        globalError(uh[0], uh[1]);
      } catch (e) {}
    });
  }
};
var PSD = globalPSD;
var microtickQueue = []; // Callbacks to call in this or next physical tick.
var numScheduledCalls = 0; // Number of listener-calls left to do in this physical tick.
var tickFinalizers = []; // Finalizers to call when there are no more async calls scheduled within current physical tick.
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
  this._listeners = [];
  this.onuncatched = nop; // Deprecate in next major. Not needed. Better to use global error handler.
  // A library may set `promise._lib = true;` after promise is created to make resolve() or reject()
  // execute the microtask engine implicitely within the call to resolve() or reject().
  // To remain A+ compliant, a library must only set `_lib=true` if it can guarantee that the stack
  // only contains library code when calling resolve() or reject().
  // RULE OF THUMB: ONLY set _lib = true for promises explicitely resolving/rejecting directly from
  // global scope (event handler, timer etc)!
  this._lib = false;
  // Current async scope
  var psd = this._PSD = PSD;
  if (debug) {
    this._stackHolder = getErrorWithStack();
    this._prev = null;
    this._numPrev = 0; // Number of previous promises (for long stacks)
  }

  if (typeof fn !== 'function') {
    if (fn !== INTERNAL) throw new TypeError('Not a function');
    // Private constructor (INTERNAL, state, value).
    // Used internally by Promise.resolve() and Promise.reject().
    this._state = arguments[1];
    this._value = arguments[2];
    if (this._state === false) handleRejection(this, this._value); // Map error, set stack and addPossiblyUnhandledError().
    return;
  }
  this._state = null; // null (=pending), false (=rejected) or true (=resolved)
  this._value = null; // error or result
  ++psd.ref; // Refcounting current scope
  executePromiseTask(this, fn);
}
// Prepare a property descriptor to put onto Promise.prototype.then
var thenProp = {
  get: function () {
    var psd = PSD,
      microTaskId = totalEchoes;
    function then(onFulfilled, onRejected) {
      var _this = this;
      var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
      if (possibleAwait) decrementExpectedAwaits();
      var rv = new Promise(function (resolve, reject) {
        propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait), resolve, reject, psd));
      });
      debug && linkToPreviousPromise(rv, this);
      return rv;
    }
    then.prototype = INTERNAL; // For idempotense, see setter below.
    return then;
  },
  // Be idempotent and allow another framework (such as zone.js or another instance of a Dexie.Promise module) to replace Promise.prototype.then
  // and when that framework wants to restore the original property, we must identify that and restore the original property descriptor.
  set: function (value) {
    setProp(this, 'then', value && value.prototype === INTERNAL ? thenProp :
    // Restore to original property descriptor.
    {
      get: function () {
        return value; // Getter returning provided value (behaves like value is just changed)
      },

      set: thenProp.set // Keep a setter that is prepared to restore original.
    });
  }
};

props(Promise.prototype, {
  then: thenProp,
  _then: function (onFulfilled, onRejected) {
    // A little tinier version of then() that don't have to create a resulting promise.
    propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
  },
  catch: function (onRejected) {
    if (arguments.length === 1) return this.then(null, onRejected);
    // First argument is the Error type to catch
    var type = arguments[0],
      handler = arguments[1];
    return typeof type === 'function' ? this.then(null, function (err) {
      // Catching errors by its constructor type (similar to java / c++ / c#)
      // Sample: promise.catch(TypeError, function (e) { ... });
      return err instanceof type ? handler(err) : PromiseReject(err);
    }) : this.then(null, function (err) {
      // Catching errors by the error.name property. Makes sense for indexedDB where error type
      // is always DOMError but where e.name tells the actual error type.
      // Sample: promise.catch('ConstraintError', function (e) { ... });
      return err && err.name === type ? handler(err) : PromiseReject(err);
    });
  },
  finally: function (onFinally) {
    return this.then(function (value) {
      onFinally();
      return value;
    }, function (err) {
      onFinally();
      return PromiseReject(err);
    });
  },
  stack: {
    get: function () {
      if (this._stack) return this._stack;
      try {
        stack_being_generated = true;
        var stacks = getStack(this, [], MAX_LONG_STACKS);
        var stack = stacks.join("\nFrom previous: ");
        if (this._state !== null) this._stack = stack; // Stack may be updated on reject.
        return stack;
      } finally {
        stack_being_generated = false;
      }
    }
  },
  timeout: function (ms, msg) {
    var _this = this;
    return ms < Infinity ? new Promise(function (resolve, reject) {
      var handle = setTimeout(function () {
        return reject(new exceptions.Timeout(msg));
      }, ms);
      _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
    }) : this;
  }
});
if (typeof Symbol !== 'undefined' && Symbol.toStringTag) setProp(Promise.prototype, Symbol.toStringTag, 'Promise');
// Now that Promise.prototype is defined, we have all it takes to set globalPSD.env.
// Environment globals snapshotted on leaving global zone
globalPSD.env = snapShot();
function Listener(onFulfilled, onRejected, resolve, reject, zone) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.resolve = resolve;
  this.reject = reject;
  this.psd = zone;
}
// Promise Static Properties
props(Promise, {
  all: function () {
    var values = getArrayOf.apply(null, arguments) // Supports iterables, implicit arguments and array-like.
    .map(onPossibleParallellAsync); // Handle parallell async/awaits 
    return new Promise(function (resolve, reject) {
      if (values.length === 0) resolve([]);
      var remaining = values.length;
      values.forEach(function (a, i) {
        return Promise.resolve(a).then(function (x) {
          values[i] = x;
          if (! --remaining) resolve(values);
        }, reject);
      });
    });
  },
  resolve: function (value) {
    if (value instanceof Promise) return value;
    if (value && typeof value.then === 'function') return new Promise(function (resolve, reject) {
      value.then(resolve, reject);
    });
    var rv = new Promise(INTERNAL, true, value);
    linkToPreviousPromise(rv, currentFulfiller);
    return rv;
  },
  reject: PromiseReject,
  race: function () {
    var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
    return new Promise(function (resolve, reject) {
      values.map(function (value) {
        return Promise.resolve(value).then(resolve, reject);
      });
    });
  },
  PSD: {
    get: function () {
      return PSD;
    },
    set: function (value) {
      return PSD = value;
    }
  },
  //totalEchoes: {get: ()=>totalEchoes},
  //task: {get: ()=>task},
  newPSD: newScope,
  usePSD: usePSD,
  scheduler: {
    get: function () {
      return asap$1;
    },
    set: function (value) {
      asap$1 = value;
    }
  },
  rejectionMapper: {
    get: function () {
      return rejectionMapper;
    },
    set: function (value) {
      rejectionMapper = value;
    } // Map reject failures
  },

  follow: function (fn, zoneProps) {
    return new Promise(function (resolve, reject) {
      return newScope(function (resolve, reject) {
        var psd = PSD;
        psd.unhandleds = []; // For unhandled standard- or 3rd party Promises. Checked at psd.finalize()
        psd.onunhandled = reject; // Triggered directly on unhandled promises of this library.
        psd.finalize = callBoth(function () {
          var _this = this;
          // Unhandled standard or 3rd part promises are put in PSD.unhandleds and
          // examined upon scope completion while unhandled rejections in this Promise
          // will trigger directly through psd.onunhandled
          run_at_end_of_this_or_next_physical_tick(function () {
            _this.unhandleds.length === 0 ? resolve() : reject(_this.unhandleds[0]);
          });
        }, psd.finalize);
        fn();
      }, zoneProps, resolve, reject);
    });
  }
});
/**
* Take a potentially misbehaving resolver function and make sure
* onFulfilled and onRejected are only called once.
*
* Makes no guarantees about asynchrony.
*/
function executePromiseTask(promise, fn) {
  // Promise Resolution Procedure:
  // https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  try {
    fn(function (value) {
      if (promise._state !== null) return; // Already settled
      if (value === promise) throw new TypeError('A promise cannot be resolved with itself.');
      var shouldExecuteTick = promise._lib && beginMicroTickScope();
      if (value && typeof value.then === 'function') {
        executePromiseTask(promise, function (resolve, reject) {
          value instanceof Promise ? value._then(resolve, reject) : value.then(resolve, reject);
        });
      } else {
        promise._state = true;
        promise._value = value;
        propagateAllListeners(promise);
      }
      if (shouldExecuteTick) endMicroTickScope();
    }, handleRejection.bind(null, promise)); // If Function.bind is not supported. Exception is handled in catch below
  } catch (ex) {
    handleRejection(promise, ex);
  }
}
function handleRejection(promise, reason) {
  rejectingErrors.push(reason);
  if (promise._state !== null) return;
  var shouldExecuteTick = promise._lib && beginMicroTickScope();
  reason = rejectionMapper(reason);
  promise._state = false;
  promise._value = reason;
  debug && reason !== null && typeof reason === 'object' && !reason._promise && tryCatch(function () {
    var origProp = getPropertyDescriptor(reason, "stack");
    reason._promise = promise;
    setProp(reason, "stack", {
      get: function () {
        return stack_being_generated ? origProp && (origProp.get ? origProp.get.apply(reason) : origProp.value) : promise.stack;
      }
    });
  });
  // Add the failure to a list of possibly uncaught errors
  addPossiblyUnhandledError(promise);
  propagateAllListeners(promise);
  if (shouldExecuteTick) endMicroTickScope();
}
function propagateAllListeners(promise) {
  //debug && linkToPreviousPromise(promise);
  var listeners = promise._listeners;
  promise._listeners = [];
  for (var i = 0, len = listeners.length; i < len; ++i) {
    propagateToListener(promise, listeners[i]);
  }
  var psd = promise._PSD;
  --psd.ref || psd.finalize(); // if psd.ref reaches zero, call psd.finalize();
  if (numScheduledCalls === 0) {
    // If numScheduledCalls is 0, it means that our stack is not in a callback of a scheduled call,
    // and that no deferreds where listening to this rejection or success.
    // Since there is a risk that our stack can contain application code that may
    // do stuff after this code is finished that may generate new calls, we cannot
    // call finalizers here.
    ++numScheduledCalls;
    asap$1(function () {
      if (--numScheduledCalls === 0) finalizePhysicalTick(); // Will detect unhandled errors
    }, []);
  }
}
function propagateToListener(promise, listener) {
  if (promise._state === null) {
    promise._listeners.push(listener);
    return;
  }
  var cb = promise._state ? listener.onFulfilled : listener.onRejected;
  if (cb === null) {
    // This Listener doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
    return (promise._state ? listener.resolve : listener.reject)(promise._value);
  }
  ++listener.psd.ref;
  ++numScheduledCalls;
  asap$1(callListener, [cb, promise, listener]);
}
function callListener(cb, promise, listener) {
  try {
    // Set static variable currentFulfiller to the promise that is being fullfilled,
    // so that we connect the chain of promises (for long stacks support)
    currentFulfiller = promise;
    // Call callback and resolve our listener with it's return value.
    var ret,
      value = promise._value;
    if (promise._state) {
      // cb is onResolved
      ret = cb(value);
    } else {
      // cb is onRejected
      if (rejectingErrors.length) rejectingErrors = [];
      ret = cb(value);
      if (rejectingErrors.indexOf(value) === -1) markErrorAsHandled(promise); // Callback didnt do Promise.reject(err) nor reject(err) onto another promise.
    }

    listener.resolve(ret);
  } catch (e) {
    // Exception thrown in callback. Reject our listener.
    listener.reject(e);
  } finally {
    // Restore env and currentFulfiller.
    currentFulfiller = null;
    if (--numScheduledCalls === 0) finalizePhysicalTick();
    --listener.psd.ref || listener.psd.finalize();
  }
}
function getStack(promise, stacks, limit) {
  if (stacks.length === limit) return stacks;
  var stack = "";
  if (promise._state === false) {
    var failure = promise._value,
      errorName,
      message;
    if (failure != null) {
      errorName = failure.name || "Error";
      message = failure.message || failure;
      stack = prettyStack(failure, 0);
    } else {
      errorName = failure; // If error is undefined or null, show that.
      message = "";
    }
    stacks.push(errorName + (message ? ": " + message : "") + stack);
  }
  if (debug) {
    stack = prettyStack(promise._stackHolder, 2);
    if (stack && stacks.indexOf(stack) === -1) stacks.push(stack);
    if (promise._prev) getStack(promise._prev, stacks, limit);
  }
  return stacks;
}
function linkToPreviousPromise(promise, prev) {
  // Support long stacks by linking to previous completed promise.
  var numPrev = prev ? prev._numPrev + 1 : 0;
  if (numPrev < LONG_STACKS_CLIP_LIMIT) {
    promise._prev = prev;
    promise._numPrev = numPrev;
  }
}
/* The callback to schedule with setImmediate() or setTimeout().
   It runs a virtual microtick and executes any callback registered in microtickQueue.
 */
function physicalTick() {
  beginMicroTickScope() && endMicroTickScope();
}
function beginMicroTickScope() {
  var wasRootExec = isOutsideMicroTick;
  isOutsideMicroTick = false;
  needsNewPhysicalTick = false;
  return wasRootExec;
}
/* Executes micro-ticks without doing try..catch.
   This can be possible because we only use this internally and
   the registered functions are exception-safe (they do try..catch
   internally before calling any external method). If registering
   functions in the microtickQueue that are not exception-safe, this
   would destroy the framework and make it instable. So we don't export
   our asap method.
*/
function endMicroTickScope() {
  var callbacks, i, l;
  do {
    while (microtickQueue.length > 0) {
      callbacks = microtickQueue;
      microtickQueue = [];
      l = callbacks.length;
      for (i = 0; i < l; ++i) {
        var item = callbacks[i];
        item[0].apply(null, item[1]);
      }
    }
  } while (microtickQueue.length > 0);
  isOutsideMicroTick = true;
  needsNewPhysicalTick = true;
}
function finalizePhysicalTick() {
  var unhandledErrs = unhandledErrors;
  unhandledErrors = [];
  unhandledErrs.forEach(function (p) {
    p._PSD.onunhandled.call(null, p._value, p);
  });
  var finalizers = tickFinalizers.slice(0); // Clone first because finalizer may remove itself from list.
  var i = finalizers.length;
  while (i) finalizers[--i]();
}
function run_at_end_of_this_or_next_physical_tick(fn) {
  function finalizer() {
    fn();
    tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
  }
  tickFinalizers.push(finalizer);
  ++numScheduledCalls;
  asap$1(function () {
    if (--numScheduledCalls === 0) finalizePhysicalTick();
  }, []);
}
function addPossiblyUnhandledError(promise) {
  // Only add to unhandledErrors if not already there. The first one to add to this list
  // will be upon the first rejection so that the root cause (first promise in the
  // rejection chain) is the one listed.
  if (!unhandledErrors.some(function (p) {
    return p._value === promise._value;
  })) unhandledErrors.push(promise);
}
function markErrorAsHandled(promise) {
  // Called when a reject handled is actually being called.
  // Search in unhandledErrors for any promise whos _value is this promise_value (list
  // contains only rejected promises, and only one item per error)
  var i = unhandledErrors.length;
  while (i) if (unhandledErrors[--i]._value === promise._value) {
    // Found a promise that failed with this same error object pointer,
    // Remove that since there is a listener that actually takes care of it.
    unhandledErrors.splice(i, 1);
    return;
  }
}
function PromiseReject(reason) {
  return new Promise(INTERNAL, false, reason);
}
function wrap(fn, errorCatcher) {
  var psd = PSD;
  return function () {
    var wasRootExec = beginMicroTickScope(),
      outerScope = PSD;
    try {
      switchToZone(psd, true);
      return fn.apply(this, arguments);
    } catch (e) {
      errorCatcher && errorCatcher(e);
    } finally {
      switchToZone(outerScope, false);
      if (wasRootExec) endMicroTickScope();
    }
  };
}
//
// variables used for native await support
//
var task = {
  awaits: 0,
  echoes: 0,
  id: 0
}; // The ongoing macro-task when using zone-echoing.
var taskCounter = 0; // ID counter for macro tasks.
var zoneStack = []; // Stack of left zones to restore asynchronically.
var zoneEchoes = 0; // zoneEchoes is a must in order to persist zones between native await expressions.
var totalEchoes = 0; // ID counter for micro-tasks. Used to detect possible native await in our Promise.prototype.then.
var zone_id_counter = 0;
function newScope(fn, props$$1, a1, a2) {
  var parent = PSD,
    psd = Object.create(parent);
  psd.parent = parent;
  psd.ref = 0;
  psd.global = false;
  psd.id = ++zone_id_counter;
  // Prepare for promise patching (done in usePSD):
  var globalEnv = globalPSD.env;
  psd.env = patchGlobalPromise ? {
    Promise: Promise,
    PromiseProp: {
      value: Promise,
      configurable: true,
      writable: true
    },
    all: Promise.all,
    race: Promise.race,
    resolve: Promise.resolve,
    reject: Promise.reject,
    nthen: getPatchedPromiseThen(globalEnv.nthen, psd),
    gthen: getPatchedPromiseThen(globalEnv.gthen, psd) // global then
  } : {};
  if (props$$1) extend(psd, props$$1);
  // unhandleds and onunhandled should not be specifically set here.
  // Leave them on parent prototype.
  // unhandleds.push(err) will push to parent's prototype
  // onunhandled() will call parents onunhandled (with this scope's this-pointer though!)
  ++parent.ref;
  psd.finalize = function () {
    --this.parent.ref || this.parent.finalize();
  };
  var rv = usePSD(psd, fn, a1, a2);
  if (psd.ref === 0) psd.finalize();
  return rv;
}
// Function to call if scopeFunc returns NativePromise
// Also for each NativePromise in the arguments to Promise.all()
function incrementExpectedAwaits() {
  if (!task.id) task.id = ++taskCounter;
  ++task.awaits;
  task.echoes += ZONE_ECHO_LIMIT;
  return task.id;
}
// Function to call when 'then' calls back on a native promise where onAwaitExpected() had been called.
// Also call this when a native await calls then method on a promise. In that case, don't supply
// sourceTaskId because we already know it refers to current task.
function decrementExpectedAwaits(sourceTaskId) {
  if (!task.awaits || sourceTaskId && sourceTaskId !== task.id) return;
  if (--task.awaits === 0) task.id = 0;
  task.echoes = task.awaits * ZONE_ECHO_LIMIT; // Will reset echoes to 0 if awaits is 0.
}
// Call from Promise.all() and Promise.race()
function onPossibleParallellAsync(possiblePromise) {
  if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
    incrementExpectedAwaits();
    return possiblePromise.then(function (x) {
      decrementExpectedAwaits();
      return x;
    }, function (e) {
      decrementExpectedAwaits();
      return rejection(e);
    });
  }
  return possiblePromise;
}
function zoneEnterEcho(targetZone) {
  ++totalEchoes;
  if (!task.echoes || --task.echoes === 0) {
    task.echoes = task.id = 0; // Cancel zone echoing.
  }

  zoneStack.push(PSD);
  switchToZone(targetZone, true);
}
function zoneLeaveEcho() {
  var zone = zoneStack[zoneStack.length - 1];
  zoneStack.pop();
  switchToZone(zone, false);
}
function switchToZone(targetZone, bEnteringZone) {
  var currentZone = PSD;
  if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (! --zoneEchoes || targetZone !== PSD)) {
    // Enter or leave zone asynchronically as well, so that tasks initiated during current tick
    // will be surrounded by the zone when they are invoked.
    enqueueNativeMicroTask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
  }
  if (targetZone === PSD) return;
  PSD = targetZone; // The actual zone switch occurs at this line.
  // Snapshot on every leave from global zone.
  if (currentZone === globalPSD) globalPSD.env = snapShot();
  if (patchGlobalPromise) {
    // Let's patch the global and native Promises (may be same or may be different)
    var GlobalPromise = globalPSD.env.Promise;
    // Swich environments (may be PSD-zone or the global zone. Both apply.)
    var targetEnv = targetZone.env;
    // Change Promise.prototype.then for native and global Promise (they MAY differ on polyfilled environments, but both can be accessed)
    // Must be done on each zone change because the patched method contains targetZone in its closure.
    nativePromiseProto.then = targetEnv.nthen;
    GlobalPromise.prototype.then = targetEnv.gthen;
    if (currentZone.global || targetZone.global) {
      // Leaving or entering global zone. It's time to patch / restore global Promise.
      // Set this Promise to window.Promise so that transiled async functions will work on Firefox, Safari and IE, as well as with Zonejs and angular.
      Object.defineProperty(_global, 'Promise', targetEnv.PromiseProp);
      // Support Promise.all() etc to work indexedDB-safe also when people are including es6-promise as a module (they might
      // not be accessing global.Promise but a local reference to it)
      GlobalPromise.all = targetEnv.all;
      GlobalPromise.race = targetEnv.race;
      GlobalPromise.resolve = targetEnv.resolve;
      GlobalPromise.reject = targetEnv.reject;
    }
  }
}
function snapShot() {
  var GlobalPromise = _global.Promise;
  return patchGlobalPromise ? {
    Promise: GlobalPromise,
    PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
    all: GlobalPromise.all,
    race: GlobalPromise.race,
    resolve: GlobalPromise.resolve,
    reject: GlobalPromise.reject,
    nthen: nativePromiseProto.then,
    gthen: GlobalPromise.prototype.then
  } : {};
}
function usePSD(psd, fn, a1, a2, a3) {
  var outerScope = PSD;
  try {
    switchToZone(psd, true);
    return fn(a1, a2, a3);
  } finally {
    switchToZone(outerScope, false);
  }
}
function enqueueNativeMicroTask(job) {
  //
  // Precondition: nativePromiseThen !== undefined
  //
  nativePromiseThen.call(resolvedNativePromise, job);
}
function nativeAwaitCompatibleWrap(fn, zone, possibleAwait) {
  return typeof fn !== 'function' ? fn : function () {
    var outerZone = PSD;
    if (possibleAwait) incrementExpectedAwaits();
    switchToZone(zone, true);
    try {
      return fn.apply(this, arguments);
    } finally {
      switchToZone(outerZone, false);
    }
  };
}
function getPatchedPromiseThen(origThen, zone) {
  return function (onResolved, onRejected) {
    return origThen.call(this, nativeAwaitCompatibleWrap(onResolved, zone, false), nativeAwaitCompatibleWrap(onRejected, zone, false));
  };
}
var UNHANDLEDREJECTION = "unhandledrejection";
function globalError(err, promise) {
  var rv;
  try {
    rv = promise.onuncatched(err);
  } catch (e) {}
  if (rv !== false) try {
    var event,
      eventData = {
        promise: promise,
        reason: err
      };
    if (_global.document && document.createEvent) {
      event = document.createEvent('Event');
      event.initEvent(UNHANDLEDREJECTION, true, true);
      extend(event, eventData);
    } else if (_global.CustomEvent) {
      event = new CustomEvent(UNHANDLEDREJECTION, {
        detail: eventData
      });
      extend(event, eventData);
    }
    if (event && _global.dispatchEvent) {
      dispatchEvent(event);
      if (!_global.PromiseRejectionEvent && _global.onunhandledrejection)
        // No native support for PromiseRejectionEvent but user has set window.onunhandledrejection. Manually call it.
        try {
          _global.onunhandledrejection(event);
        } catch (_) {}
    }
    if (!event.defaultPrevented) {
      console.warn("Unhandled rejection: " + (err.stack || err));
    }
  } catch (e) {}
}
var rejection = Promise.reject;
function Events(ctx) {
  var evs = {};
  var rv = function (eventName, subscriber) {
    if (subscriber) {
      // Subscribe. If additional arguments than just the subscriber was provided, forward them as well.
      var i = arguments.length,
        args = new Array(i - 1);
      while (--i) args[i - 1] = arguments[i];
      evs[eventName].subscribe.apply(null, args);
      return ctx;
    } else if (typeof eventName === 'string') {
      // Return interface allowing to fire or unsubscribe from event
      return evs[eventName];
    }
  };
  rv.addEventType = add;
  for (var i = 1, l = arguments.length; i < l; ++i) {
    add(arguments[i]);
  }
  return rv;
  function add(eventName, chainFunction, defaultFunction) {
    if (typeof eventName === 'object') return addConfiguredEvents(eventName);
    if (!chainFunction) chainFunction = reverseStoppableEventChain;
    if (!defaultFunction) defaultFunction = nop;
    var context = {
      subscribers: [],
      fire: defaultFunction,
      subscribe: function (cb) {
        if (context.subscribers.indexOf(cb) === -1) {
          context.subscribers.push(cb);
          context.fire = chainFunction(context.fire, cb);
        }
      },
      unsubscribe: function (cb) {
        context.subscribers = context.subscribers.filter(function (fn) {
          return fn !== cb;
        });
        context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
      }
    };
    evs[eventName] = rv[eventName] = context;
    return context;
  }
  function addConfiguredEvents(cfg) {
    // events(this, {reading: [functionChain, nop]});
    keys(cfg).forEach(function (eventName) {
      var args = cfg[eventName];
      if (isArray(args)) {
        add(eventName, cfg[eventName][0], cfg[eventName][1]);
      } else if (args === 'asap') {
        // Rather than approaching event subscription using a functional approach, we here do it in a for-loop where subscriber is executed in its own stack
        // enabling that any exception that occur wont disturb the initiator and also not nescessary be catched and forgotten.
        var context = add(eventName, mirror, function fire() {
          // Optimazation-safe cloning of arguments into args.
          var i = arguments.length,
            args = new Array(i);
          while (i--) args[i] = arguments[i];
          // All each subscriber:
          context.subscribers.forEach(function (fn) {
            asap(function fireEvent() {
              fn.apply(null, args);
            });
          });
        });
      } else throw new exceptions.InvalidArgument("Invalid event config");
    });
  }
}

/*
 * Dexie.js - a minimalistic wrapper for IndexedDB
 * ===============================================
 *
 * Copyright (c) 2014-2017 David Fahlander
 *
 * Version {version}, {date}
 *
 * http://dexie.org
 *
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/LICENSE-2.0
 *
 */
var DEXIE_VERSION = '{version}';
var maxString = String.fromCharCode(65535);
var maxKey = function () {
  try {
    IDBKeyRange.only([[]]);
    return [[]];
  } catch (e) {
    return maxString;
  }
}();
var minKey = -Infinity;
var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
var STRING_EXPECTED = "String expected.";
var connections = [];
var isIEOrEdge = typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
var hasIEDeleteObjectStoreBug = isIEOrEdge;
var hangsOnDeleteLargeKeyRange = isIEOrEdge;
var dexieStackFrameFilter = function (frame) {
  return !/(dexie\.js|dexie\.min\.js)/.test(frame);
};
var dbNamesDB; // Global database for backing Dexie.getDatabaseNames() on browser without indexedDB.webkitGetDatabaseNames() 
// Init debug
setDebug(debug, dexieStackFrameFilter);
function Dexie(dbName, options) {
  /// <param name="options" type="Object" optional="true">Specify only if you wich to control which addons that should run on this instance</param>
  var deps = Dexie.dependencies;
  var opts = extend({
    // Default Options
    addons: Dexie.addons,
    autoOpen: true,
    indexedDB: deps.indexedDB,
    IDBKeyRange: deps.IDBKeyRange // Backend IDBKeyRange api. Default to browser env.
  }, options);
  var addons = opts.addons,
    autoOpen = opts.autoOpen,
    indexedDB = opts.indexedDB,
    IDBKeyRange = opts.IDBKeyRange;
  var globalSchema = this._dbSchema = {};
  var versions = [];
  var dbStoreNames = [];
  var allTables = {};
  ///<var type="IDBDatabase" />
  var idbdb = null; // Instance of IDBDatabase
  var dbOpenError = null;
  var isBeingOpened = false;
  var onReadyBeingFired = null;
  var openComplete = false;
  var READONLY = "readonly",
    READWRITE = "readwrite";
  var db = this;
  var dbReadyResolve,
    dbReadyPromise = new Promise(function (resolve) {
      dbReadyResolve = resolve;
    }),
    cancelOpen,
    openCanceller = new Promise(function (_, reject) {
      cancelOpen = reject;
    });
  var autoSchema = true;
  var hasNativeGetDatabaseNames = !!getNativeGetDatabaseNamesFn(indexedDB),
    hasGetAll;
  function init() {
    // Default subscribers to "versionchange" and "blocked".
    // Can be overridden by custom handlers. If custom handlers return false, these default
    // behaviours will be prevented.
    db.on("versionchange", function (ev) {
      // Default behavior for versionchange event is to close database connection.
      // Caller can override this behavior by doing db.on("versionchange", function(){ return false; });
      // Let's not block the other window from making it's delete() or open() call.
      // NOTE! This event is never fired in IE,Edge or Safari.
      if (ev.newVersion > 0) console.warn("Another connection wants to upgrade database '" + db.name + "'. Closing db now to resume the upgrade.");else console.warn("Another connection wants to delete database '" + db.name + "'. Closing db now to resume the delete request.");
      db.close();
      // In many web applications, it would be recommended to force window.reload()
      // when this event occurs. To do that, subscribe to the versionchange event
      // and call window.location.reload(true) if ev.newVersion > 0 (not a deletion)
      // The reason for this is that your current web app obviously has old schema code that needs
      // to be updated. Another window got a newer version of the app and needs to upgrade DB but
      // your window is blocking it unless we close it here.
    });

    db.on("blocked", function (ev) {
      if (!ev.newVersion || ev.newVersion < ev.oldVersion) console.warn("Dexie.delete('" + db.name + "') was blocked");else console.warn("Upgrade '" + db.name + "' blocked by other connection holding version " + ev.oldVersion / 10);
    });
  }
  //
  //
  //
  // ------------------------- Versioning Framework---------------------------
  //
  //
  //
  this.version = function (versionNumber) {
    /// <param name="versionNumber" type="Number"></param>
    /// <returns type="Version"></returns>
    if (idbdb || isBeingOpened) throw new exceptions.Schema("Cannot add version when database is open");
    this.verno = Math.max(this.verno, versionNumber);
    var versionInstance = versions.filter(function (v) {
      return v._cfg.version === versionNumber;
    })[0];
    if (versionInstance) return versionInstance;
    versionInstance = new Version(versionNumber);
    versions.push(versionInstance);
    versions.sort(lowerVersionFirst);
    // Disable autoschema mode, as at least one version is specified.
    autoSchema = false;
    return versionInstance;
  };
  function Version(versionNumber) {
    this._cfg = {
      version: versionNumber,
      storesSource: null,
      dbschema: {},
      tables: {},
      contentUpgrade: null
    };
    this.stores({}); // Derive earlier schemas by default.
  }

  extend(Version.prototype, {
    stores: function (stores) {
      /// <summary>
      ///   Defines the schema for a particular version
      /// </summary>
      /// <param name="stores" type="Object">
      /// Example: <br/>
      ///   {users: "id++,first,last,&amp;username,*email", <br/>
      ///   passwords: "id++,&amp;username"}<br/>
      /// <br/>
      /// Syntax: {Table: "[primaryKey][++],[&amp;][*]index1,[&amp;][*]index2,..."}<br/><br/>
      /// Special characters:<br/>
      ///  "&amp;"  means unique key, <br/>
      ///  "*"  means value is multiEntry, <br/>
      ///  "++" means auto-increment and only applicable for primary key <br/>
      /// </param>
      this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;
      // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.
      var storesSpec = {};
      versions.forEach(function (version) {
        extend(storesSpec, version._cfg.storesSource);
      });
      var dbschema = this._cfg.dbschema = {};
      this._parseStoresSpec(storesSpec, dbschema);
      // Update the latest schema to this version
      // Update API
      globalSchema = db._dbSchema = dbschema;
      removeTablesApi([allTables, db, Transaction.prototype]); // Keep Transaction.prototype even though it should be depr.
      setApiOnPlace([allTables, db, Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
      dbStoreNames = keys(dbschema);
      return this;
    },
    upgrade: function (upgradeFunction) {
      this._cfg.contentUpgrade = upgradeFunction;
      return this;
    },
    _parseStoresSpec: function (stores, outSchema) {
      keys(stores).forEach(function (tableName) {
        if (stores[tableName] !== null) {
          var instanceTemplate = {};
          var indexes = parseIndexSyntax(stores[tableName]);
          var primKey = indexes.shift();
          if (primKey.multi) throw new exceptions.Schema("Primary key cannot be multi-valued");
          if (primKey.keyPath) setByKeyPath(instanceTemplate, primKey.keyPath, primKey.auto ? 0 : primKey.keyPath);
          indexes.forEach(function (idx) {
            if (idx.auto) throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
            if (!idx.keyPath) throw new exceptions.Schema("Index must have a name and cannot be an empty string");
            setByKeyPath(instanceTemplate, idx.keyPath, idx.compound ? idx.keyPath.map(function () {
              return "";
            }) : "");
          });
          outSchema[tableName] = new TableSchema(tableName, primKey, indexes, instanceTemplate);
        }
      });
    }
  });
  function runUpgraders(oldVersion, idbtrans, reject) {
    var trans = db._createTransaction(READWRITE, dbStoreNames, globalSchema);
    trans.create(idbtrans);
    trans._completion.catch(reject);
    var rejectTransaction = trans._reject.bind(trans);
    newScope(function () {
      PSD.trans = trans;
      if (oldVersion === 0) {
        // Create tables:
        keys(globalSchema).forEach(function (tableName) {
          createTable(idbtrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
        });
        Promise.follow(function () {
          return db.on.populate.fire(trans);
        }).catch(rejectTransaction);
      } else updateTablesAndIndexes(oldVersion, trans, idbtrans).catch(rejectTransaction);
    });
  }
  function updateTablesAndIndexes(oldVersion, trans, idbtrans) {
    // Upgrade version to version, step-by-step from oldest to newest version.
    // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
    var queue = [];
    var oldVersionStruct = versions.filter(function (version) {
      return version._cfg.version === oldVersion;
    })[0];
    if (!oldVersionStruct) throw new exceptions.Upgrade("Dexie specification of currently installed DB version is missing");
    globalSchema = db._dbSchema = oldVersionStruct._cfg.dbschema;
    var anyContentUpgraderHasRun = false;
    var versToRun = versions.filter(function (v) {
      return v._cfg.version > oldVersion;
    });
    versToRun.forEach(function (version) {
      /// <param name="version" type="Version"></param>
      queue.push(function () {
        var oldSchema = globalSchema;
        var newSchema = version._cfg.dbschema;
        adjustToExistingIndexNames(oldSchema, idbtrans);
        adjustToExistingIndexNames(newSchema, idbtrans);
        globalSchema = db._dbSchema = newSchema;
        var diff = getSchemaDiff(oldSchema, newSchema);
        // Add tables           
        diff.add.forEach(function (tuple) {
          createTable(idbtrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
        });
        // Change tables
        diff.change.forEach(function (change) {
          if (change.recreate) {
            throw new exceptions.Upgrade("Not yet support for changing primary key");
          } else {
            var store = idbtrans.objectStore(change.name);
            // Add indexes
            change.add.forEach(function (idx) {
              addIndex(store, idx);
            });
            // Update indexes
            change.change.forEach(function (idx) {
              store.deleteIndex(idx.name);
              addIndex(store, idx);
            });
            // Delete indexes
            change.del.forEach(function (idxName) {
              store.deleteIndex(idxName);
            });
          }
        });
        if (version._cfg.contentUpgrade) {
          anyContentUpgraderHasRun = true;
          return Promise.follow(function () {
            version._cfg.contentUpgrade(trans);
          });
        }
      });
      queue.push(function (idbtrans) {
        if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug) {
          var newSchema = version._cfg.dbschema;
          // Delete old tables
          deleteRemovedTables(newSchema, idbtrans);
        }
      });
    });
    // Now, create a queue execution engine
    function runQueue() {
      return queue.length ? Promise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) : Promise.resolve();
    }
    return runQueue().then(function () {
      createMissingTables(globalSchema, idbtrans); // At last, make sure to create any missing tables. (Needed by addons that add stores to DB without specifying version)
    });
  }

  function getSchemaDiff(oldSchema, newSchema) {
    var diff = {
      del: [],
      add: [],
      change: [] // Array of {name: tableName, recreate: newDefinition, del: delIndexNames, add: newIndexDefs, change: changedIndexDefs}
    };

    for (var table in oldSchema) {
      if (!newSchema[table]) diff.del.push(table);
    }
    for (table in newSchema) {
      var oldDef = oldSchema[table],
        newDef = newSchema[table];
      if (!oldDef) {
        diff.add.push([table, newDef]);
      } else {
        var change = {
          name: table,
          def: newDef,
          recreate: false,
          del: [],
          add: [],
          change: []
        };
        if (oldDef.primKey.src !== newDef.primKey.src) {
          // Primary key has changed. Remove and re-add table.
          change.recreate = true;
          diff.change.push(change);
        } else {
          // Same primary key. Just find out what differs:
          var oldIndexes = oldDef.idxByName;
          var newIndexes = newDef.idxByName;
          for (var idxName in oldIndexes) {
            if (!newIndexes[idxName]) change.del.push(idxName);
          }
          for (idxName in newIndexes) {
            var oldIdx = oldIndexes[idxName],
              newIdx = newIndexes[idxName];
            if (!oldIdx) change.add.push(newIdx);else if (oldIdx.src !== newIdx.src) change.change.push(newIdx);
          }
          if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
            diff.change.push(change);
          }
        }
      }
    }
    return diff;
  }
  function createTable(idbtrans, tableName, primKey, indexes) {
    /// <param name="idbtrans" type="IDBTransaction"></param>
    var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? {
      keyPath: primKey.keyPath,
      autoIncrement: primKey.auto
    } : {
      autoIncrement: primKey.auto
    });
    indexes.forEach(function (idx) {
      addIndex(store, idx);
    });
    return store;
  }
  function createMissingTables(newSchema, idbtrans) {
    keys(newSchema).forEach(function (tableName) {
      if (!idbtrans.db.objectStoreNames.contains(tableName)) {
        createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
      }
    });
  }
  function deleteRemovedTables(newSchema, idbtrans) {
    for (var i = 0; i < idbtrans.db.objectStoreNames.length; ++i) {
      var storeName = idbtrans.db.objectStoreNames[i];
      if (newSchema[storeName] == null) {
        idbtrans.db.deleteObjectStore(storeName);
      }
    }
  }
  function addIndex(store, idx) {
    store.createIndex(idx.name, idx.keyPath, {
      unique: idx.unique,
      multiEntry: idx.multi
    });
  }
  //
  //
  //      Dexie Protected API
  //
  //
  this._allTables = allTables;
  this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) {
    return new Transaction(mode, storeNames, dbschema, parentTransaction);
  };
  /* Generate a temporary transaction when db operations are done outside a transaction scope.
  */
  function tempTransaction(mode, storeNames, fn) {
    if (!openComplete && !PSD.letThrough) {
      if (!isBeingOpened) {
        if (!autoOpen) return rejection(new exceptions.DatabaseClosed());
        db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
      }

      return dbReadyPromise.then(function () {
        return tempTransaction(mode, storeNames, fn);
      });
    } else {
      var trans = db._createTransaction(mode, storeNames, globalSchema);
      try {
        trans.create();
      } catch (ex) {
        return rejection(ex);
      }
      return trans._promise(mode, function (resolve, reject) {
        return newScope(function () {
          PSD.trans = trans;
          return fn(resolve, reject, trans);
        });
      }).then(function (result) {
        // Instead of resolving value directly, wait with resolving it until transaction has completed.
        // Otherwise the data would not be in the DB if requesting it in the then() operation.
        // Specifically, to ensure that the following expression will work:
        //
        //   db.friends.put({name: "Arne"}).then(function () {
        //       db.friends.where("name").equals("Arne").count(function(count) {
        //           assert (count === 1);
        //       });
        //   });
        //
        return trans._completion.then(function () {
          return result;
        });
      }); /*.catch(err => { // Don't do this as of now. If would affect bulk- and modify methods in a way that could be more intuitive. But wait! Maybe change in next major.
          trans._reject(err);
          return rejection(err);
          });*/
    }
  }

  this._whenReady = function (fn) {
    return openComplete || PSD.letThrough ? fn() : new Promise(function (resolve, reject) {
      if (!isBeingOpened) {
        if (!autoOpen) {
          reject(new exceptions.DatabaseClosed());
          return;
        }
        db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
      }

      dbReadyPromise.then(resolve, reject);
    }).then(fn);
  };
  //
  //
  //
  //
  //      Dexie API
  //
  //
  //
  this.verno = 0;
  this.open = function () {
    if (isBeingOpened || idbdb) return dbReadyPromise.then(function () {
      return dbOpenError ? rejection(dbOpenError) : db;
    });
    debug && (openCanceller._stackHolder = getErrorWithStack()); // Let stacks point to when open() was called rather than where new Dexie() was called.
    isBeingOpened = true;
    dbOpenError = null;
    openComplete = false;
    // Function pointers to call when the core opening process completes.
    var resolveDbReady = dbReadyResolve,
      // upgradeTransaction to abort on failure.
      upgradeTransaction = null;
    return Promise.race([openCanceller, new Promise(function (resolve, reject) {
      // Multiply db.verno with 10 will be needed to workaround upgrading bug in IE:
      // IE fails when deleting objectStore after reading from it.
      // A future version of Dexie.js will stopover an intermediate version to workaround this.
      // At that point, we want to be backward compatible. Could have been multiplied with 2, but by using 10, it is easier to map the number to the real version number.
      // If no API, throw!
      if (!indexedDB) throw new exceptions.MissingAPI("indexedDB API not found. If using IE10+, make sure to run your code on a server URL " + "(not locally). If using old Safari versions, make sure to include indexedDB polyfill.");
      var req = autoSchema ? indexedDB.open(dbName) : indexedDB.open(dbName, Math.round(db.verno * 10));
      if (!req) throw new exceptions.MissingAPI("IndexedDB API not available"); // May happen in Safari private mode, see https://github.com/dfahlander/Dexie.js/issues/134
      req.onerror = eventRejectHandler(reject);
      req.onblocked = wrap(fireOnBlocked);
      req.onupgradeneeded = wrap(function (e) {
        upgradeTransaction = req.transaction;
        if (autoSchema && !db._allowEmptyDB) {
          // Caller did not specify a version or schema. Doing that is only acceptable for opening alread existing databases.
          // If onupgradeneeded is called it means database did not exist. Reject the open() promise and make sure that we
          // do not create a new database by accident here.
          req.onerror = preventDefault; // Prohibit onabort error from firing before we're done!
          upgradeTransaction.abort(); // Abort transaction (would hope that this would make DB disappear but it doesnt.)
          // Close database and delete it.
          req.result.close();
          var delreq = indexedDB.deleteDatabase(dbName); // The upgrade transaction is atomic, and javascript is single threaded - meaning that there is no risk that we delete someone elses database here!
          delreq.onsuccess = delreq.onerror = wrap(function () {
            reject(new exceptions.NoSuchDatabase("Database " + dbName + " doesnt exist"));
          });
        } else {
          upgradeTransaction.onerror = eventRejectHandler(reject);
          var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion; // Safari 8 fix.
          runUpgraders(oldVer / 10, upgradeTransaction, reject, req);
        }
      }, reject);
      req.onsuccess = wrap(function () {
        // Core opening procedure complete. Now let's just record some stuff.
        upgradeTransaction = null;
        idbdb = req.result;
        connections.push(db); // Used for emulating versionchange event on IE/Edge/Safari.
        if (autoSchema) readGlobalSchema();else if (idbdb.objectStoreNames.length > 0) {
          try {
            adjustToExistingIndexNames(globalSchema, idbdb.transaction(safariMultiStoreFix(idbdb.objectStoreNames), READONLY));
          } catch (e) {
            // Safari may bail out if > 1 store names. However, this shouldnt be a showstopper. Issue #120.
          }
        }
        idbdb.onversionchange = wrap(function (ev) {
          db._vcFired = true; // detect implementations that not support versionchange (IE/Edge/Safari)
          db.on("versionchange").fire(ev);
        });
        if (!hasNativeGetDatabaseNames && dbName !== '__dbnames') {
          dbNamesDB.dbnames.put({
            name: dbName
          }).catch(nop);
        }
        resolve();
      }, reject);
    })]).then(function () {
      // Before finally resolving the dbReadyPromise and this promise,
      // call and await all on('ready') subscribers:
      // Dexie.vip() makes subscribers able to use the database while being opened.
      // This is a must since these subscribers take part of the opening procedure.
      onReadyBeingFired = [];
      return Promise.resolve(Dexie.vip(db.on.ready.fire)).then(function fireRemainders() {
        if (onReadyBeingFired.length > 0) {
          // In case additional subscribers to db.on('ready') were added during the time db.on.ready.fire was executed.
          var remainders = onReadyBeingFired.reduce(promisableChain, nop);
          onReadyBeingFired = [];
          return Promise.resolve(Dexie.vip(remainders)).then(fireRemainders);
        }
      });
    }).finally(function () {
      onReadyBeingFired = null;
    }).then(function () {
      // Resolve the db.open() with the db instance.
      isBeingOpened = false;
      return db;
    }).catch(function (err) {
      try {
        // Did we fail within onupgradeneeded? Make sure to abort the upgrade transaction so it doesnt commit.
        upgradeTransaction && upgradeTransaction.abort();
      } catch (e) {}
      isBeingOpened = false; // Set before calling db.close() so that it doesnt reject openCanceller again (leads to unhandled rejection event).
      db.close(); // Closes and resets idbdb, removes connections, resets dbReadyPromise and openCanceller so that a later db.open() is fresh.
      // A call to db.close() may have made on-ready subscribers fail. Use dbOpenError if set, since err could be a follow-up error on that.
      dbOpenError = err; // Record the error. It will be used to reject further promises of db operations.
      return rejection(dbOpenError);
    }).finally(function () {
      openComplete = true;
      resolveDbReady(); // dbReadyPromise is resolved no matter if open() rejects or resolved. It's just to wake up waiters.
    });
  };

  this.close = function () {
    var idx = connections.indexOf(db);
    if (idx >= 0) connections.splice(idx, 1);
    if (idbdb) {
      try {
        idbdb.close();
      } catch (e) {}
      idbdb = null;
    }
    autoOpen = false;
    dbOpenError = new exceptions.DatabaseClosed();
    if (isBeingOpened) cancelOpen(dbOpenError);
    // Reset dbReadyPromise promise:
    dbReadyPromise = new Promise(function (resolve) {
      dbReadyResolve = resolve;
    });
    openCanceller = new Promise(function (_, reject) {
      cancelOpen = reject;
    });
  };
  this.delete = function () {
    var hasArguments = arguments.length > 0;
    return new Promise(function (resolve, reject) {
      if (hasArguments) throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");
      if (isBeingOpened) {
        dbReadyPromise.then(doDelete);
      } else {
        doDelete();
      }
      function doDelete() {
        db.close();
        var req = indexedDB.deleteDatabase(dbName);
        req.onsuccess = wrap(function () {
          if (!hasNativeGetDatabaseNames) {
            dbNamesDB.dbnames.delete(dbName).catch(nop);
          }
          resolve();
        });
        req.onerror = eventRejectHandler(reject);
        req.onblocked = fireOnBlocked;
      }
    });
  };
  this.backendDB = function () {
    return idbdb;
  };
  this.isOpen = function () {
    return idbdb !== null;
  };
  this.hasBeenClosed = function () {
    return dbOpenError && dbOpenError instanceof exceptions.DatabaseClosed;
  };
  this.hasFailed = function () {
    return dbOpenError !== null;
  };
  this.dynamicallyOpened = function () {
    return autoSchema;
  };
  //
  // Properties
  //
  this.name = dbName;
  // db.tables - an array of all Table instances.
  props(this, {
    tables: {
      get: function () {
        /// <returns type="Array" elementType="Table" />
        return keys(allTables).map(function (name) {
          return allTables[name];
        });
      }
    }
  });
  //
  // Events
  //
  this.on = Events(this, "populate", "blocked", "versionchange", {
    ready: [promisableChain, nop]
  });
  this.on.ready.subscribe = override(this.on.ready.subscribe, function (subscribe) {
    return function (subscriber, bSticky) {
      Dexie.vip(function () {
        if (openComplete) {
          // Database already open. Call subscriber asap.
          if (!dbOpenError) Promise.resolve().then(subscriber);
          // bSticky: Also subscribe to future open sucesses (after close / reopen) 
          if (bSticky) subscribe(subscriber);
        } else if (onReadyBeingFired) {
          // db.on('ready') subscribers are currently being executed and have not yet resolved or rejected
          onReadyBeingFired.push(subscriber);
          if (bSticky) subscribe(subscriber);
        } else {
          // Database not yet open. Subscribe to it.
          subscribe(subscriber);
          // If bSticky is falsy, make sure to unsubscribe subscriber when fired once.
          if (!bSticky) subscribe(function unsubscribe() {
            db.on.ready.unsubscribe(subscriber);
            db.on.ready.unsubscribe(unsubscribe);
          });
        }
      });
    };
  });
  this.transaction = function () {
    /// <summary>
    ///
    /// </summary>
    /// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
    /// <param name="tableInstances">Table instance, Array of Table instances, String or String Array of object stores to include in the transaction</param>
    /// <param name="scopeFunc" type="Function">Function to execute with transaction</param>
    var args = extractTransactionArgs.apply(this, arguments);
    return this._transaction.apply(this, args);
  };
  function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
    // Let table arguments be all arguments between mode and last argument.
    var i = arguments.length;
    if (i < 2) throw new exceptions.InvalidArgument("Too few arguments");
    // Prevent optimzation killer (https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments)
    // and clone arguments except the first one into local var 'args'.
    var args = new Array(i - 1);
    while (--i) args[i - 1] = arguments[i];
    // Let scopeFunc be the last argument and pop it so that args now only contain the table arguments.
    scopeFunc = args.pop();
    var tables = flatten(args); // Support using array as middle argument, or a mix of arrays and non-arrays.
    return [mode, tables, scopeFunc];
  }
  this._transaction = function (mode, tables, scopeFunc) {
    var parentTransaction = PSD.trans;
    // Check if parent transactions is bound to this db instance, and if caller wants to reuse it
    if (!parentTransaction || parentTransaction.db !== db || mode.indexOf('!') !== -1) parentTransaction = null;
    var onlyIfCompatible = mode.indexOf('?') !== -1;
    mode = mode.replace('!', '').replace('?', ''); // Ok. Will change arguments[0] as well but we wont touch arguments henceforth.
    try {
      //
      // Get storeNames from arguments. Either through given table instances, or through given table names.
      //
      var storeNames = tables.map(function (table) {
        var storeName = table instanceof Table ? table.name : table;
        if (typeof storeName !== 'string') throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
        return storeName;
      });
      //
      // Resolve mode. Allow shortcuts "r" and "rw".
      //
      if (mode == "r" || mode == READONLY) mode = READONLY;else if (mode == "rw" || mode == READWRITE) mode = READWRITE;else throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
      if (parentTransaction) {
        // Basic checks
        if (parentTransaction.mode === READONLY && mode === READWRITE) {
          if (onlyIfCompatible) {
            // Spawn new transaction instead.
            parentTransaction = null;
          } else throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
        }
        if (parentTransaction) {
          storeNames.forEach(function (storeName) {
            if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
              if (onlyIfCompatible) {
                // Spawn new transaction instead.
                parentTransaction = null;
              } else throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
            }
          });
        }
        if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
          // '?' mode should not keep using an inactive transaction.
          parentTransaction = null;
        }
      }
    } catch (e) {
      return parentTransaction ? parentTransaction._promise(null, function (_, reject) {
        reject(e);
      }) : rejection(e);
    }
    // If this is a sub-transaction, lock the parent and then launch the sub-transaction.
    return parentTransaction ? parentTransaction._promise(mode, enterTransactionScope, "lock") : PSD.trans ?
    // no parent transaction despite PSD.trans exists. Make sure also
    // that the zone we create is not a sub-zone of current, because
    // Promise.follow() should not wait for it if so.
    usePSD(PSD.transless, function () {
      return db._whenReady(enterTransactionScope);
    }) : db._whenReady(enterTransactionScope);
    function enterTransactionScope() {
      return Promise.resolve().then(function () {
        // Keep a pointer to last non-transactional PSD to use if someone calls Dexie.ignoreTransaction().
        var transless = PSD.transless || PSD;
        // Our transaction.
        //return new Promise((resolve, reject) => {
        var trans = db._createTransaction(mode, storeNames, globalSchema, parentTransaction);
        // Let the transaction instance be part of a Promise-specific data (PSD) value.
        var zoneProps = {
          trans: trans,
          transless: transless
        };
        if (parentTransaction) {
          // Emulate transaction commit awareness for inner transaction (must 'commit' when the inner transaction has no more operations ongoing)
          trans.idbtrans = parentTransaction.idbtrans;
        } else {
          trans.create(); // Create the backend transaction so that complete() or error() will trigger even if no operation is made upon it.
        }
        // Support for native async await.
        if (scopeFunc.constructor === AsyncFunction) {
          incrementExpectedAwaits();
        }
        var returnValue;
        var promiseFollowed = Promise.follow(function () {
          // Finally, call the scope function with our table and transaction arguments.
          returnValue = scopeFunc.call(trans, trans);
          if (returnValue) {
            if (returnValue.constructor === NativePromise) {
              var decrementor = decrementExpectedAwaits.bind(null, null);
              returnValue.then(decrementor, decrementor);
            } else if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
              // scopeFunc returned an iterator with throw-support. Handle yield as await.
              returnValue = awaitIterator(returnValue);
            }
          }
        }, zoneProps);
        return (returnValue && typeof returnValue.then === 'function' ?
        // Promise returned. User uses promise-style transactions.
        Promise.resolve(returnValue).then(function (x) {
          return trans.active ? x // Transaction still active. Continue.
          : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
        })
        // No promise returned. Wait for all outstanding promises before continuing. 
        : promiseFollowed.then(function () {
          return returnValue;
        })).then(function (x) {
          // sub transactions don't react to idbtrans.oncomplete. We must trigger a completion:
          if (parentTransaction) trans._resolve();
          // wait for trans._completion
          // (if root transaction, this means 'complete' event. If sub-transaction, we've just fired it ourselves)
          return trans._completion.then(function () {
            return x;
          });
        }).catch(function (e) {
          trans._reject(e); // Yes, above then-handler were maybe not called because of an unhandled rejection in scopeFunc!
          return rejection(e);
        });
      });
    }
  };
  this.table = function (tableName) {
    /// <returns type="Table"></returns>
    if (!hasOwn(allTables, tableName)) {
      throw new exceptions.InvalidTable("Table " + tableName + " does not exist");
    }
    return allTables[tableName];
  };
  //
  //
  //
  // Table Class
  //
  //
  //
  function Table(name, tableSchema, optionalTrans) {
    /// <param name="name" type="String"></param>
    this.name = name;
    this.schema = tableSchema;
    this._tx = optionalTrans;
    this.hook = allTables[name] ? allTables[name].hook : Events(null, {
      "creating": [hookCreatingChain, nop],
      "reading": [pureFunctionChain, mirror],
      "updating": [hookUpdatingChain, nop],
      "deleting": [hookDeletingChain, nop]
    });
  }
  function BulkErrorHandlerCatchAll(errorList, done, supportHooks) {
    return (supportHooks ? hookedEventRejectHandler : eventRejectHandler)(function (e) {
      errorList.push(e);
      done && done();
    });
  }
  function bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook) {
    // If hasDeleteHook, keysOrTuples must be an array of tuples: [[key1, value2],[key2,value2],...],
    // else keysOrTuples must be just an array of keys: [key1, key2, ...].
    return new Promise(function (resolve, reject) {
      var len = keysOrTuples.length,
        lastItem = len - 1;
      if (len === 0) return resolve();
      if (!hasDeleteHook) {
        for (var i = 0; i < len; ++i) {
          var req = idbstore.delete(keysOrTuples[i]);
          req.onerror = eventRejectHandler(reject);
          if (i === lastItem) req.onsuccess = wrap(function () {
            return resolve();
          });
        }
      } else {
        var hookCtx,
          errorHandler = hookedEventRejectHandler(reject),
          successHandler = hookedEventSuccessHandler(null);
        tryCatch(function () {
          for (var i = 0; i < len; ++i) {
            hookCtx = {
              onsuccess: null,
              onerror: null
            };
            var tuple = keysOrTuples[i];
            deletingHook.call(hookCtx, tuple[0], tuple[1], trans);
            var req = idbstore.delete(tuple[0]);
            req._hookCtx = hookCtx;
            req.onerror = errorHandler;
            if (i === lastItem) req.onsuccess = hookedEventSuccessHandler(resolve);else req.onsuccess = successHandler;
          }
        }, function (err) {
          hookCtx.onerror && hookCtx.onerror(err);
          throw err;
        });
      }
    });
  }
  props(Table.prototype, {
    //
    // Table Protected Methods
    //
    _trans: function getTransaction(mode, fn, writeLocked) {
      var trans = this._tx || PSD.trans;
      return trans && trans.db === db ? trans === PSD.trans ? trans._promise(mode, fn, writeLocked) : newScope(function () {
        return trans._promise(mode, fn, writeLocked);
      }, {
        trans: trans,
        transless: PSD.transless || PSD
      }) : tempTransaction(mode, [this.name], fn);
    },
    _idbstore: function getIDBObjectStore(mode, fn, writeLocked) {
      var tableName = this.name;
      function supplyIdbStore(resolve, reject, trans) {
        if (trans.storeNames.indexOf(tableName) === -1) throw new exceptions.NotFound("Table" + tableName + " not part of transaction");
        return fn(resolve, reject, trans.idbtrans.objectStore(tableName), trans);
      }
      return this._trans(mode, supplyIdbStore, writeLocked);
    },
    //
    // Table Public Methods
    //
    get: function (keyOrCrit, cb) {
      if (keyOrCrit && keyOrCrit.constructor === Object) return this.where(keyOrCrit).first(cb);
      var self = this;
      return this._idbstore(READONLY, function (resolve, reject, idbstore) {
        var req = idbstore.get(keyOrCrit);
        req.onerror = eventRejectHandler(reject);
        req.onsuccess = wrap(function () {
          resolve(self.hook.reading.fire(req.result));
        }, reject);
      }).then(cb);
    },
    where: function (indexOrCrit) {
      if (typeof indexOrCrit === 'string') return new WhereClause(this, indexOrCrit);
      if (isArray(indexOrCrit)) return new WhereClause(this, "[" + indexOrCrit.join('+') + "]");
      // indexOrCrit is an object map of {[keyPath]:value} 
      var keyPaths = keys(indexOrCrit);
      if (keyPaths.length === 1)
        // Only one critera. This was the easy case:
        return this.where(keyPaths[0]).equals(indexOrCrit[keyPaths[0]]);
      // Multiple criterias.
      // Let's try finding a compound index that matches all keyPaths in
      // arbritary order:
      var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function (ix) {
        return ix.compound && keyPaths.every(function (keyPath) {
          return ix.keyPath.indexOf(keyPath) >= 0;
        }) && ix.keyPath.every(function (keyPath) {
          return keyPaths.indexOf(keyPath) >= 0;
        });
      })[0];
      if (compoundIndex && maxKey !== maxString)
        // Cool! We found such compound index
        // and this browser supports compound indexes (maxKey !== maxString)!
        return this.where(compoundIndex.name).equals(compoundIndex.keyPath.map(function (kp) {
          return indexOrCrit[kp];
        }));
      if (!compoundIndex) console.warn("The query " + JSON.stringify(indexOrCrit) + " on " + this.name + " would benefit of a " + ("compound index [" + keyPaths.join('+') + "]"));
      // Ok, now let's fallback to finding at least one matching index
      // and filter the rest.
      var idxByName = this.schema.idxByName;
      var simpleIndex = keyPaths.reduce(function (r, keyPath) {
        return [r[0] || idxByName[keyPath], r[0] || !idxByName[keyPath] ? combine(r[1], function (x) {
          return '' + getByKeyPath(x, keyPath) == '' + indexOrCrit[keyPath];
        }) : r[1]];
      }, [null, null]);
      var idx = simpleIndex[0];
      return idx ? this.where(idx.name).equals(indexOrCrit[idx.keyPath]).filter(simpleIndex[1]) : compoundIndex ? this.filter(simpleIndex[1]) :
      // Has compound but browser bad. Allow filter.
      this.where(keyPaths).equals(''); // No index at all. Fail lazily.
    },

    count: function (cb) {
      return this.toCollection().count(cb);
    },
    offset: function (offset) {
      return this.toCollection().offset(offset);
    },
    limit: function (numRows) {
      return this.toCollection().limit(numRows);
    },
    reverse: function () {
      return this.toCollection().reverse();
    },
    filter: function (filterFunction) {
      return this.toCollection().and(filterFunction);
    },
    each: function (fn) {
      return this.toCollection().each(fn);
    },
    toArray: function (cb) {
      return this.toCollection().toArray(cb);
    },
    orderBy: function (index) {
      return new Collection(new WhereClause(this, isArray(index) ? "[" + index.join('+') + "]" : index));
    },
    toCollection: function () {
      return new Collection(new WhereClause(this));
    },
    mapToClass: function (constructor, structure) {
      /// <summary>
      ///     Map table to a javascript constructor function. Objects returned from the database will be instances of this class, making
      ///     it possible to the instanceOf operator as well as extending the class using constructor.prototype.method = function(){...}.
      /// </summary>
      /// <param name="constructor">Constructor function representing the class.</param>
      /// <param name="structure" optional="true">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
      /// know what type each member has. Example: {name: String, emailAddresses: [String], password}</param>
      this.schema.mappedClass = constructor;
      var instanceTemplate = Object.create(constructor.prototype);
      if (structure) {
        // structure and instanceTemplate is for IDE code competion only while constructor.prototype is for actual inheritance.
        applyStructure(instanceTemplate, structure);
      }
      this.schema.instanceTemplate = instanceTemplate;
      // Now, subscribe to the when("reading") event to make all objects that come out from this table inherit from given class
      // no matter which method to use for reading (Table.get() or Table.where(...)... )
      var readHook = function (obj) {
        if (!obj) return obj; // No valid object. (Value is null). Return as is.
        // Create a new object that derives from constructor:
        var res = Object.create(constructor.prototype);
        // Clone members:
        for (var m in obj) if (hasOwn(obj, m)) try {
          res[m] = obj[m];
        } catch (_) {}
        return res;
      };
      if (this.schema.readHook) {
        this.hook.reading.unsubscribe(this.schema.readHook);
      }
      this.schema.readHook = readHook;
      this.hook("reading", readHook);
      return constructor;
    },
    defineClass: function (structure) {
      /// <summary>
      ///     Define all members of the class that represents the table. This will help code completion of when objects are read from the database
      ///     as well as making it possible to extend the prototype of the returned constructor function.
      /// </summary>
      /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
      /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>
      return this.mapToClass(Dexie.defineClass(structure), structure);
    },
    bulkDelete: function (keys$$1) {
      if (this.hook.deleting.fire === nop) {
        return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
          resolve(bulkDelete(idbstore, trans, keys$$1, false, nop));
        });
      } else {
        return this.where(':id').anyOf(keys$$1).delete().then(function () {}); // Resolve with undefined.
      }
    },

    bulkPut: function (objects, keys$$1) {
      var _this = this;
      return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
        if (!idbstore.keyPath && !_this.schema.primKey.auto && !keys$$1) throw new exceptions.InvalidArgument("bulkPut() with non-inbound keys requires keys array in second argument");
        if (idbstore.keyPath && keys$$1) throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
        if (keys$$1 && keys$$1.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
        if (objects.length === 0) return resolve(); // Caller provided empty list.
        var done = function (result) {
          if (errorList.length === 0) resolve(result);else reject(new BulkError(_this.name + ".bulkPut(): " + errorList.length + " of " + numObjs + " operations failed", errorList));
        };
        var req,
          errorList = [],
          errorHandler,
          numObjs = objects.length,
          table = _this;
        if (_this.hook.creating.fire === nop && _this.hook.updating.fire === nop) {
          //
          // Standard Bulk (no 'creating' or 'updating' hooks to care about)
          //
          errorHandler = BulkErrorHandlerCatchAll(errorList);
          for (var i = 0, l = objects.length; i < l; ++i) {
            req = keys$$1 ? idbstore.put(objects[i], keys$$1[i]) : idbstore.put(objects[i]);
            req.onerror = errorHandler;
          }
          // Only need to catch success or error on the last operation
          // according to the IDB spec.
          req.onerror = BulkErrorHandlerCatchAll(errorList, done);
          req.onsuccess = eventSuccessHandler(done);
        } else {
          var effectiveKeys = keys$$1 || idbstore.keyPath && objects.map(function (o) {
            return getByKeyPath(o, idbstore.keyPath);
          });
          // Generate map of {[key]: object}
          var objectLookup = effectiveKeys && arrayToObject(effectiveKeys, function (key, i) {
            return key != null && [key, objects[i]];
          });
          var promise = !effectiveKeys ?
          // Auto-incremented key-less objects only without any keys argument.
          table.bulkAdd(objects) :
          // Keys provided. Either as inbound in provided objects, or as a keys argument.
          // Begin with updating those that exists in DB:
          table.where(':id').anyOf(effectiveKeys.filter(function (key) {
            return key != null;
          })).modify(function () {
            this.value = objectLookup[this.primKey];
            objectLookup[this.primKey] = null; // Mark as "don't add this"
          }).catch(ModifyError, function (e) {
            errorList = e.failures; // No need to concat here. These are the first errors added.
          }).then(function () {
            // Now, let's examine which items didnt exist so we can add them:
            var objsToAdd = [],
              keysToAdd = keys$$1 && [];
            // Iterate backwards. Why? Because if same key was used twice, just add the last one.
            for (var i = effectiveKeys.length - 1; i >= 0; --i) {
              var key = effectiveKeys[i];
              if (key == null || objectLookup[key]) {
                objsToAdd.push(objects[i]);
                keys$$1 && keysToAdd.push(key);
                if (key != null) objectLookup[key] = null; // Mark as "dont add again"
              }
            }
            // The items are in reverse order so reverse them before adding.
            // Could be important in order to get auto-incremented keys the way the caller
            // would expect. Could have used unshift instead of push()/reverse(),
            // but: http://jsperf.com/unshift-vs-reverse
            objsToAdd.reverse();
            keys$$1 && keysToAdd.reverse();
            return table.bulkAdd(objsToAdd, keysToAdd);
          }).then(function (lastAddedKey) {
            // Resolve with key of the last object in given arguments to bulkPut():
            var lastEffectiveKey = effectiveKeys[effectiveKeys.length - 1]; // Key was provided.
            return lastEffectiveKey != null ? lastEffectiveKey : lastAddedKey;
          });
          promise.then(done).catch(BulkError, function (e) {
            // Concat failure from ModifyError and reject using our 'done' method.
            errorList = errorList.concat(e.failures);
            done();
          }).catch(reject);
        }
      }, "locked"); // If called from transaction scope, lock transaction til all steps are done.
    },

    bulkAdd: function (objects, keys$$1) {
      var self = this,
        creatingHook = this.hook.creating.fire;
      return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
        if (!idbstore.keyPath && !self.schema.primKey.auto && !keys$$1) throw new exceptions.InvalidArgument("bulkAdd() with non-inbound keys requires keys array in second argument");
        if (idbstore.keyPath && keys$$1) throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
        if (keys$$1 && keys$$1.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
        if (objects.length === 0) return resolve(); // Caller provided empty list.
        function done(result) {
          if (errorList.length === 0) resolve(result);else reject(new BulkError(self.name + ".bulkAdd(): " + errorList.length + " of " + numObjs + " operations failed", errorList));
        }
        var req,
          errorList = [],
          errorHandler,
          successHandler,
          numObjs = objects.length;
        if (creatingHook !== nop) {
          //
          // There are subscribers to hook('creating')
          // Must behave as documented.
          //
          var keyPath = idbstore.keyPath,
            hookCtx;
          errorHandler = BulkErrorHandlerCatchAll(errorList, null, true);
          successHandler = hookedEventSuccessHandler(null);
          tryCatch(function () {
            for (var i = 0, l = objects.length; i < l; ++i) {
              hookCtx = {
                onerror: null,
                onsuccess: null
              };
              var key = keys$$1 && keys$$1[i];
              var obj = objects[i],
                effectiveKey = keys$$1 ? key : keyPath ? getByKeyPath(obj, keyPath) : undefined,
                keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans);
              if (effectiveKey == null && keyToUse != null) {
                if (keyPath) {
                  obj = deepClone(obj);
                  setByKeyPath(obj, keyPath, keyToUse);
                } else {
                  key = keyToUse;
                }
              }
              req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
              req._hookCtx = hookCtx;
              if (i < l - 1) {
                req.onerror = errorHandler;
                if (hookCtx.onsuccess) req.onsuccess = successHandler;
              }
            }
          }, function (err) {
            hookCtx.onerror && hookCtx.onerror(err);
            throw err;
          });
          req.onerror = BulkErrorHandlerCatchAll(errorList, done, true);
          req.onsuccess = hookedEventSuccessHandler(done);
        } else {
          //
          // Standard Bulk (no 'creating' hook to care about)
          //
          errorHandler = BulkErrorHandlerCatchAll(errorList);
          for (var i = 0, l = objects.length; i < l; ++i) {
            req = keys$$1 ? idbstore.add(objects[i], keys$$1[i]) : idbstore.add(objects[i]);
            req.onerror = errorHandler;
          }
          // Only need to catch success or error on the last operation
          // according to the IDB spec.
          req.onerror = BulkErrorHandlerCatchAll(errorList, done);
          req.onsuccess = eventSuccessHandler(done);
        }
      });
    },
    add: function (obj, key) {
      /// <summary>
      ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
      /// </summary>
      /// <param name="obj" type="Object">A javascript object to insert</param>
      /// <param name="key" optional="true">Primary key</param>
      var creatingHook = this.hook.creating.fire;
      return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
        var hookCtx = {
          onsuccess: null,
          onerror: null
        };
        if (creatingHook !== nop) {
          var effectiveKey = key != null ? key : idbstore.keyPath ? getByKeyPath(obj, idbstore.keyPath) : undefined;
          var keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans); // Allow subscribers to when("creating") to generate the key.
          if (effectiveKey == null && keyToUse != null) {
            if (idbstore.keyPath) setByKeyPath(obj, idbstore.keyPath, keyToUse);else key = keyToUse;
          }
        }
        try {
          var req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
          req._hookCtx = hookCtx;
          req.onerror = hookedEventRejectHandler(reject);
          req.onsuccess = hookedEventSuccessHandler(function (result) {
            // TODO: Remove these two lines in next major release (2.0?)
            // It's no good practice to have side effects on provided parameters
            var keyPath = idbstore.keyPath;
            if (keyPath) setByKeyPath(obj, keyPath, result);
            resolve(result);
          });
        } catch (e) {
          if (hookCtx.onerror) hookCtx.onerror(e);
          throw e;
        }
      });
    },
    put: function (obj, key) {
      var _this = this;
      /// <summary>
      ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
      /// </summary>
      /// <param name="obj" type="Object">A javascript object to insert or update</param>
      /// <param name="key" optional="true">Primary key</param>
      var creatingHook = this.hook.creating.fire,
        updatingHook = this.hook.updating.fire;
      if (creatingHook !== nop || updatingHook !== nop) {
        //
        // People listens to when("creating") or when("updating") events!
        // We must know whether the put operation results in an CREATE or UPDATE.
        //
        var keyPath = this.schema.primKey.keyPath;
        var effectiveKey = key !== undefined ? key : keyPath && getByKeyPath(obj, keyPath);
        if (effectiveKey == null) return this.add(obj);
        // Since key is optional, make sure we get it from obj if not provided
        // Primary key exist. Lock transaction and try modifying existing. If nothing modified, call add().
        // clone obj before this async call. If caller modifies obj the line after put(), the IDB spec requires that it should not affect operation.
        obj = deepClone(obj);
        return this._trans(READWRITE, function () {
          return _this.where(":id").equals(effectiveKey).modify(function () {
            // Replace extisting value with our object
            // CRUD event firing handled in Collection.modify()
            this.value = obj;
          }).then(function (count) {
            return count === 0 ? _this.add(obj, key) : effectiveKey;
          });
        }, "locked"); // Lock needed because operation is splitted into modify() and add().
      } else {
        // Use the standard IDB put() method.
        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
          var req = key !== undefined ? idbstore.put(obj, key) : idbstore.put(obj);
          req.onerror = eventRejectHandler(reject);
          req.onsuccess = wrap(function (ev) {
            var keyPath = idbstore.keyPath;
            if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
            resolve(req.result);
          });
        });
      }
    },
    'delete': function (key) {
      /// <param name="key">Primary key of the object to delete</param>
      if (this.hook.deleting.subscribers.length) {
        // People listens to when("deleting") event. Must implement delete using Collection.delete() that will
        // call the CRUD event. Only Collection.delete() will know whether an object was actually deleted.
        return this.where(":id").equals(key).delete();
      } else {
        // No one listens. Use standard IDB delete() method.
        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
          var req = idbstore.delete(key);
          req.onerror = eventRejectHandler(reject);
          req.onsuccess = wrap(function () {
            resolve(req.result);
          });
        });
      }
    },
    clear: function () {
      if (this.hook.deleting.subscribers.length) {
        // People listens to when("deleting") event. Must implement delete using Collection.delete() that will
        // call the CRUD event. Only Collection.delete() will knows which objects that are actually deleted.
        return this.toCollection().delete();
      } else {
        return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
          var req = idbstore.clear();
          req.onerror = eventRejectHandler(reject);
          req.onsuccess = wrap(function () {
            resolve(req.result);
          });
        });
      }
    },
    update: function (keyOrObject, modifications) {
      if (typeof modifications !== 'object' || isArray(modifications)) throw new exceptions.InvalidArgument("Modifications must be an object.");
      if (typeof keyOrObject === 'object' && !isArray(keyOrObject)) {
        // object to modify. Also modify given object with the modifications:
        keys(modifications).forEach(function (keyPath) {
          setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
        });
        var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
        if (key === undefined) return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
        return this.where(":id").equals(key).modify(modifications);
      } else {
        // key to modify
        return this.where(":id").equals(keyOrObject).modify(modifications);
      }
    }
  });
  //
  //
  //
  // Transaction Class
  //
  //
  //
  function Transaction(mode, storeNames, dbschema, parent) {
    var _this = this;
    /// <summary>
    ///    Transaction class. Represents a database transaction. All operations on db goes through a Transaction.
    /// </summary>
    /// <param name="mode" type="String">Any of "readwrite" or "readonly"</param>
    /// <param name="storeNames" type="Array">Array of table names to operate on</param>
    this.db = db;
    this.mode = mode;
    this.storeNames = storeNames;
    this.idbtrans = null;
    this.on = Events(this, "complete", "error", "abort");
    this.parent = parent || null;
    this.active = true;
    this._reculock = 0;
    this._blockedFuncs = [];
    this._resolve = null;
    this._reject = null;
    this._waitingFor = null;
    this._waitingQueue = null;
    this._spinCount = 0; // Just for debugging waitFor()
    this._completion = new Promise(function (resolve, reject) {
      _this._resolve = resolve;
      _this._reject = reject;
    });
    this._completion.then(function () {
      _this.active = false;
      _this.on.complete.fire();
    }, function (e) {
      var wasActive = _this.active;
      _this.active = false;
      _this.on.error.fire(e);
      _this.parent ? _this.parent._reject(e) : wasActive && _this.idbtrans && _this.idbtrans.abort();
      return rejection(e); // Indicate we actually DO NOT catch this error.
    });
  }

  props(Transaction.prototype, {
    //
    // Transaction Protected Methods (not required by API users, but needed internally and eventually by dexie extensions)
    //
    _lock: function () {
      assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
      // Temporary set all requests into a pending queue if they are called before database is ready.
      ++this._reculock; // Recursive read/write lock pattern using PSD (Promise Specific Data) instead of TLS (Thread Local Storage)
      if (this._reculock === 1 && !PSD.global) PSD.lockOwnerFor = this;
      return this;
    },
    _unlock: function () {
      assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
      if (--this._reculock === 0) {
        if (!PSD.global) PSD.lockOwnerFor = null;
        while (this._blockedFuncs.length > 0 && !this._locked()) {
          var fnAndPSD = this._blockedFuncs.shift();
          try {
            usePSD(fnAndPSD[1], fnAndPSD[0]);
          } catch (e) {}
        }
      }
      return this;
    },
    _locked: function () {
      // Checks if any write-lock is applied on this transaction.
      // To simplify the Dexie API for extension implementations, we support recursive locks.
      // This is accomplished by using "Promise Specific Data" (PSD).
      // PSD data is bound to a Promise and any child Promise emitted through then() or resolve( new Promise() ).
      // PSD is local to code executing on top of the call stacks of any of any code executed by Promise():
      //         * callback given to the Promise() constructor  (function (resolve, reject){...})
      //         * callbacks given to then()/catch()/finally() methods (function (value){...})
      // If creating a new independant Promise instance from within a Promise call stack, the new Promise will derive the PSD from the call stack of the parent Promise.
      // Derivation is done so that the inner PSD __proto__ points to the outer PSD.
      // PSD.lockOwnerFor will point to current transaction object if the currently executing PSD scope owns the lock.
      return this._reculock && PSD.lockOwnerFor !== this;
    },
    create: function (idbtrans) {
      var _this = this;
      if (!this.mode) return this;
      assert(!this.idbtrans);
      if (!idbtrans && !idbdb) {
        switch (dbOpenError && dbOpenError.name) {
          case "DatabaseClosedError":
            // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
            throw new exceptions.DatabaseClosed(dbOpenError);
          case "MissingAPIError":
            // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
            throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
          default:
            // Make it clear that the user operation was not what caused the error - the error had occurred earlier on db.open()!
            throw new exceptions.OpenFailed(dbOpenError);
        }
      }
      if (!this.active) throw new exceptions.TransactionInactive();
      assert(this._completion._state === null);
      idbtrans = this.idbtrans = idbtrans || idbdb.transaction(safariMultiStoreFix(this.storeNames), this.mode);
      idbtrans.onerror = wrap(function (ev) {
        preventDefault(ev); // Prohibit default bubbling to window.error
        _this._reject(idbtrans.error);
      });
      idbtrans.onabort = wrap(function (ev) {
        preventDefault(ev);
        _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
        _this.active = false;
        _this.on("abort").fire(ev);
      });
      idbtrans.oncomplete = wrap(function () {
        _this.active = false;
        _this._resolve();
      });
      return this;
    },
    _promise: function (mode, fn, bWriteLock) {
      var _this = this;
      if (mode === READWRITE && this.mode !== READWRITE) return rejection(new exceptions.ReadOnly("Transaction is readonly"));
      if (!this.active) return rejection(new exceptions.TransactionInactive());
      if (this._locked()) {
        return new Promise(function (resolve, reject) {
          _this._blockedFuncs.push([function () {
            _this._promise(mode, fn, bWriteLock).then(resolve, reject);
          }, PSD]);
        });
      } else if (bWriteLock) {
        return newScope(function () {
          var p = new Promise(function (resolve, reject) {
            _this._lock();
            var rv = fn(resolve, reject, _this);
            if (rv && rv.then) rv.then(resolve, reject);
          });
          p.finally(function () {
            return _this._unlock();
          });
          p._lib = true;
          return p;
        });
      } else {
        var p = new Promise(function (resolve, reject) {
          var rv = fn(resolve, reject, _this);
          if (rv && rv.then) rv.then(resolve, reject);
        });
        p._lib = true;
        return p;
      }
    },
    _root: function () {
      return this.parent ? this.parent._root() : this;
    },
    waitFor: function (promise) {
      // Always operate on the root transaction (in case this is a sub stransaction)
      var root = this._root();
      // For stability reasons, convert parameter to promise no matter what type is passed to waitFor().
      // (We must be able to call .then() on it.)
      promise = Promise.resolve(promise);
      if (root._waitingFor) {
        // Already called waitFor(). Wait for both to complete.
        root._waitingFor = root._waitingFor.then(function () {
          return promise;
        });
      } else {
        // We're not in waiting state. Start waiting state.
        root._waitingFor = promise;
        root._waitingQueue = [];
        // Start interacting with indexedDB until promise completes:
        var store = root.idbtrans.objectStore(root.storeNames[0]);
        (function spin() {
          ++root._spinCount; // For debugging only
          while (root._waitingQueue.length) root._waitingQueue.shift()();
          if (root._waitingFor) store.get(-Infinity).onsuccess = spin;
        })();
      }
      var currentWaitPromise = root._waitingFor;
      return new Promise(function (resolve, reject) {
        promise.then(function (res) {
          return root._waitingQueue.push(wrap(resolve.bind(null, res)));
        }, function (err) {
          return root._waitingQueue.push(wrap(reject.bind(null, err)));
        }).finally(function () {
          if (root._waitingFor === currentWaitPromise) {
            // No one added a wait after us. Safe to stop the spinning.
            root._waitingFor = null;
          }
        });
      });
    },
    //
    // Transaction Public Properties and Methods
    //
    abort: function () {
      this.active && this._reject(new exceptions.Abort());
      this.active = false;
    },
    tables: {
      get: deprecated("Transaction.tables", function () {
        return allTables;
      })
    },
    table: function (name) {
      var table = db.table(name); // Don't check that table is part of transaction. It must fail lazily!
      return new Table(name, table.schema, this);
    }
  });
  //
  //
  //
  // WhereClause
  //
  //
  //
  function WhereClause(table, index, orCollection) {
    /// <param name="table" type="Table"></param>
    /// <param name="index" type="String" optional="true"></param>
    /// <param name="orCollection" type="Collection" optional="true"></param>
    this._ctx = {
      table: table,
      index: index === ":id" ? null : index,
      or: orCollection
    };
  }
  props(WhereClause.prototype, function () {
    // WhereClause private methods
    function fail(collectionOrWhereClause, err, T) {
      var collection = collectionOrWhereClause instanceof WhereClause ? new Collection(collectionOrWhereClause) : collectionOrWhereClause;
      collection._ctx.error = T ? new T(err) : new TypeError(err);
      return collection;
    }
    function emptyCollection(whereClause) {
      return new Collection(whereClause, function () {
        return IDBKeyRange.only("");
      }).limit(0);
    }
    function upperFactory(dir) {
      return dir === "next" ? function (s) {
        return s.toUpperCase();
      } : function (s) {
        return s.toLowerCase();
      };
    }
    function lowerFactory(dir) {
      return dir === "next" ? function (s) {
        return s.toLowerCase();
      } : function (s) {
        return s.toUpperCase();
      };
    }
    function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
      var length = Math.min(key.length, lowerNeedle.length);
      var llp = -1;
      for (var i = 0; i < length; ++i) {
        var lwrKeyChar = lowerKey[i];
        if (lwrKeyChar !== lowerNeedle[i]) {
          if (cmp(key[i], upperNeedle[i]) < 0) return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
          if (cmp(key[i], lowerNeedle[i]) < 0) return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
          if (llp >= 0) return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
          return null;
        }
        if (cmp(key[i], lwrKeyChar) < 0) llp = i;
      }
      if (length < lowerNeedle.length && dir === "next") return key + upperNeedle.substr(key.length);
      if (length < key.length && dir === "prev") return key.substr(0, upperNeedle.length);
      return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
    }
    function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
      /// <param name="needles" type="Array" elementType="String"></param>
      var upper,
        lower,
        compare,
        upperNeedles,
        lowerNeedles,
        direction,
        nextKeySuffix,
        needlesLen = needles.length;
      if (!needles.every(function (s) {
        return typeof s === 'string';
      })) {
        return fail(whereClause, STRING_EXPECTED);
      }
      function initDirection(dir) {
        upper = upperFactory(dir);
        lower = lowerFactory(dir);
        compare = dir === "next" ? simpleCompare : simpleCompareReverse;
        var needleBounds = needles.map(function (needle) {
          return {
            lower: lower(needle),
            upper: upper(needle)
          };
        }).sort(function (a, b) {
          return compare(a.lower, b.lower);
        });
        upperNeedles = needleBounds.map(function (nb) {
          return nb.upper;
        });
        lowerNeedles = needleBounds.map(function (nb) {
          return nb.lower;
        });
        direction = dir;
        nextKeySuffix = dir === "next" ? "" : suffix;
      }
      initDirection("next");
      var c = new Collection(whereClause, function () {
        return IDBKeyRange.bound(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
      });
      c._ondirectionchange = function (direction) {
        // This event onlys occur before filter is called the first time.
        initDirection(direction);
      };
      var firstPossibleNeedle = 0;
      c._addAlgorithm(function (cursor, advance, resolve) {
        /// <param name="cursor" type="IDBCursor"></param>
        /// <param name="advance" type="Function"></param>
        /// <param name="resolve" type="Function"></param>
        var key = cursor.key;
        if (typeof key !== 'string') return false;
        var lowerKey = lower(key);
        if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
          return true;
        } else {
          var lowestPossibleCasing = null;
          for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
            var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
            if (casing === null && lowestPossibleCasing === null) firstPossibleNeedle = i + 1;else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
              lowestPossibleCasing = casing;
            }
          }
          if (lowestPossibleCasing !== null) {
            advance(function () {
              cursor.continue(lowestPossibleCasing + nextKeySuffix);
            });
          } else {
            advance(resolve);
          }
          return false;
        }
      });
      return c;
    }
    //
    // WhereClause public methods
    //
    return {
      between: function (lower, upper, includeLower, includeUpper) {
        /// <summary>
        ///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
        /// </summary>
        /// <param name="lower"></param>
        /// <param name="upper"></param>
        /// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
        /// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
        /// <returns type="Collection"></returns>
        includeLower = includeLower !== false; // Default to true
        includeUpper = includeUpper === true; // Default to false
        try {
          if (cmp(lower, upper) > 0 || cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)) return emptyCollection(this); // Workaround for idiotic W3C Specification that DataError must be thrown if lower > upper. The natural result would be to return an empty collection.
          return new Collection(this, function () {
            return IDBKeyRange.bound(lower, upper, !includeLower, !includeUpper);
          });
        } catch (e) {
          return fail(this, INVALID_KEY_ARGUMENT);
        }
      },
      equals: function (value) {
        return new Collection(this, function () {
          return IDBKeyRange.only(value);
        });
      },
      above: function (value) {
        return new Collection(this, function () {
          return IDBKeyRange.lowerBound(value, true);
        });
      },
      aboveOrEqual: function (value) {
        return new Collection(this, function () {
          return IDBKeyRange.lowerBound(value);
        });
      },
      below: function (value) {
        return new Collection(this, function () {
          return IDBKeyRange.upperBound(value, true);
        });
      },
      belowOrEqual: function (value) {
        return new Collection(this, function () {
          return IDBKeyRange.upperBound(value);
        });
      },
      startsWith: function (str) {
        /// <param name="str" type="String"></param>
        if (typeof str !== 'string') return fail(this, STRING_EXPECTED);
        return this.between(str, str + maxString, true, true);
      },
      startsWithIgnoreCase: function (str) {
        /// <param name="str" type="String"></param>
        if (str === "") return this.startsWith(str);
        return addIgnoreCaseAlgorithm(this, function (x, a) {
          return x.indexOf(a[0]) === 0;
        }, [str], maxString);
      },
      equalsIgnoreCase: function (str) {
        /// <param name="str" type="String"></param>
        return addIgnoreCaseAlgorithm(this, function (x, a) {
          return x === a[0];
        }, [str], "");
      },
      anyOfIgnoreCase: function () {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (set.length === 0) return emptyCollection(this);
        return addIgnoreCaseAlgorithm(this, function (x, a) {
          return a.indexOf(x) !== -1;
        }, set, "");
      },
      startsWithAnyOfIgnoreCase: function () {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (set.length === 0) return emptyCollection(this);
        return addIgnoreCaseAlgorithm(this, function (x, a) {
          return a.some(function (n) {
            return x.indexOf(n) === 0;
          });
        }, set, maxString);
      },
      anyOf: function () {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        var compare = ascending;
        try {
          set.sort(compare);
        } catch (e) {
          return fail(this, INVALID_KEY_ARGUMENT);
        }
        if (set.length === 0) return emptyCollection(this);
        var c = new Collection(this, function () {
          return IDBKeyRange.bound(set[0], set[set.length - 1]);
        });
        c._ondirectionchange = function (direction) {
          compare = direction === "next" ? ascending : descending;
          set.sort(compare);
        };
        var i = 0;
        c._addAlgorithm(function (cursor, advance, resolve) {
          var key = cursor.key;
          while (compare(key, set[i]) > 0) {
            // The cursor has passed beyond this key. Check next.
            ++i;
            if (i === set.length) {
              // There is no next. Stop searching.
              advance(resolve);
              return false;
            }
          }
          if (compare(key, set[i]) === 0) {
            // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
            return true;
          } else {
            // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
            advance(function () {
              cursor.continue(set[i]);
            });
            return false;
          }
        });
        return c;
      },
      notEqual: function (value) {
        return this.inAnyRange([[minKey, value], [value, maxKey]], {
          includeLowers: false,
          includeUppers: false
        });
      },
      noneOf: function () {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (set.length === 0) return new Collection(this); // Return entire collection.
        try {
          set.sort(ascending);
        } catch (e) {
          return fail(this, INVALID_KEY_ARGUMENT);
        }
        // Transform ["a","b","c"] to a set of ranges for between/above/below: [[minKey,"a"], ["a","b"], ["b","c"], ["c",maxKey]]
        var ranges = set.reduce(function (res, val) {
          return res ? res.concat([[res[res.length - 1][1], val]]) : [[minKey, val]];
        }, null);
        ranges.push([set[set.length - 1], maxKey]);
        return this.inAnyRange(ranges, {
          includeLowers: false,
          includeUppers: false
        });
      },
      /** Filter out values withing given set of ranges.
      * Example, give children and elders a rebate of 50%:
      *
      *   db.friends.where('age').inAnyRange([[0,18],[65,Infinity]]).modify({Rebate: 1/2});
      *
      * @param {(string|number|Date|Array)[][]} ranges
      * @param {{includeLowers: boolean, includeUppers: boolean}} options
      */
      inAnyRange: function (ranges, options) {
        if (ranges.length === 0) return emptyCollection(this);
        if (!ranges.every(function (range) {
          return range[0] !== undefined && range[1] !== undefined && ascending(range[0], range[1]) <= 0;
        })) {
          return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
        }
        var includeLowers = !options || options.includeLowers !== false; // Default to true
        var includeUppers = options && options.includeUppers === true; // Default to false
        function addRange(ranges, newRange) {
          for (var i = 0, l = ranges.length; i < l; ++i) {
            var range = ranges[i];
            if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
              range[0] = min(range[0], newRange[0]);
              range[1] = max(range[1], newRange[1]);
              break;
            }
          }
          if (i === l) ranges.push(newRange);
          return ranges;
        }
        var sortDirection = ascending;
        function rangeSorter(a, b) {
          return sortDirection(a[0], b[0]);
        }
        // Join overlapping ranges
        var set;
        try {
          set = ranges.reduce(addRange, []);
          set.sort(rangeSorter);
        } catch (ex) {
          return fail(this, INVALID_KEY_ARGUMENT);
        }
        var i = 0;
        var keyIsBeyondCurrentEntry = includeUppers ? function (key) {
          return ascending(key, set[i][1]) > 0;
        } : function (key) {
          return ascending(key, set[i][1]) >= 0;
        };
        var keyIsBeforeCurrentEntry = includeLowers ? function (key) {
          return descending(key, set[i][0]) > 0;
        } : function (key) {
          return descending(key, set[i][0]) >= 0;
        };
        function keyWithinCurrentRange(key) {
          return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
        }
        var checkKey = keyIsBeyondCurrentEntry;
        var c = new Collection(this, function () {
          return IDBKeyRange.bound(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
        });
        c._ondirectionchange = function (direction) {
          if (direction === "next") {
            checkKey = keyIsBeyondCurrentEntry;
            sortDirection = ascending;
          } else {
            checkKey = keyIsBeforeCurrentEntry;
            sortDirection = descending;
          }
          set.sort(rangeSorter);
        };
        c._addAlgorithm(function (cursor, advance, resolve) {
          var key = cursor.key;
          while (checkKey(key)) {
            // The cursor has passed beyond this key. Check next.
            ++i;
            if (i === set.length) {
              // There is no next. Stop searching.
              advance(resolve);
              return false;
            }
          }
          if (keyWithinCurrentRange(key)) {
            // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
            return true;
          } else if (cmp(key, set[i][1]) === 0 || cmp(key, set[i][0]) === 0) {
            // includeUpper or includeLower is false so keyWithinCurrentRange() returns false even though we are at range border.
            // Continue to next key but don't include this one.
            return false;
          } else {
            // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
            advance(function () {
              if (sortDirection === ascending) cursor.continue(set[i][0]);else cursor.continue(set[i][1]);
            });
            return false;
          }
        });
        return c;
      },
      startsWithAnyOf: function () {
        var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
        if (!set.every(function (s) {
          return typeof s === 'string';
        })) {
          return fail(this, "startsWithAnyOf() only works with strings");
        }
        if (set.length === 0) return emptyCollection(this);
        return this.inAnyRange(set.map(function (str) {
          return [str, str + maxString];
        }));
      }
    };
  });
  //
  //
  //
  // Collection Class
  //
  //
  //
  function Collection(whereClause, keyRangeGenerator) {
    /// <summary>
    ///
    /// </summary>
    /// <param name="whereClause" type="WhereClause">Where clause instance</param>
    /// <param name="keyRangeGenerator" value="function(){ return IDBKeyRange.bound(0,1);}" optional="true"></param>
    var keyRange = null,
      error = null;
    if (keyRangeGenerator) try {
      keyRange = keyRangeGenerator();
    } catch (ex) {
      error = ex;
    }
    var whereCtx = whereClause._ctx,
      table = whereCtx.table;
    this._ctx = {
      table: table,
      index: whereCtx.index,
      isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
      range: keyRange,
      keysOnly: false,
      dir: "next",
      unique: "",
      algorithm: null,
      filter: null,
      replayFilter: null,
      justLimit: true,
      isMatch: null,
      offset: 0,
      limit: Infinity,
      error: error,
      or: whereCtx.or,
      valueMapper: table.hook.reading.fire
    };
  }
  function isPlainKeyRange(ctx, ignoreLimitFilter) {
    return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
  }
  props(Collection.prototype, function () {
    //
    // Collection Private Functions
    //
    function addFilter(ctx, fn) {
      ctx.filter = combine(ctx.filter, fn);
    }
    function addReplayFilter(ctx, factory, isLimitFilter) {
      var curr = ctx.replayFilter;
      ctx.replayFilter = curr ? function () {
        return combine(curr(), factory());
      } : factory;
      ctx.justLimit = isLimitFilter && !curr;
    }
    function addMatchFilter(ctx, fn) {
      ctx.isMatch = combine(ctx.isMatch, fn);
    }
    /** @param ctx {
     *      isPrimKey: boolean,
     *      table: Table,
     *      index: string
     * }
     * @param store IDBObjectStore
     **/
    function getIndexOrStore(ctx, store) {
      if (ctx.isPrimKey) return store;
      var indexSpec = ctx.table.schema.idxByName[ctx.index];
      if (!indexSpec) throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + store.name + " is not indexed");
      return store.index(indexSpec.name);
    }
    /** @param ctx {
     *      isPrimKey: boolean,
     *      table: Table,
     *      index: string,
     *      keysOnly: boolean,
     *      range?: IDBKeyRange,
     *      dir: "next" | "prev"
     * }
     */
    function openCursor(ctx, store) {
      var idxOrStore = getIndexOrStore(ctx, store);
      return ctx.keysOnly && 'openKeyCursor' in idxOrStore ? idxOrStore.openKeyCursor(ctx.range || null, ctx.dir + ctx.unique) : idxOrStore.openCursor(ctx.range || null, ctx.dir + ctx.unique);
    }
    function iter(ctx, fn, resolve, reject, idbstore) {
      var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
      if (!ctx.or) {
        iterate(openCursor(ctx, idbstore), combine(ctx.algorithm, filter), fn, resolve, reject, !ctx.keysOnly && ctx.valueMapper);
      } else (function () {
        var set = {};
        var resolved = 0;
        function resolveboth() {
          if (++resolved === 2) resolve(); // Seems like we just support or btwn max 2 expressions, but there are no limit because we do recursion.
        }

        function union(item, cursor, advance) {
          if (!filter || filter(cursor, advance, resolveboth, reject)) {
            var primaryKey = cursor.primaryKey;
            var key = '' + primaryKey;
            if (key === '[object ArrayBuffer]') key = '' + new Uint8Array(primaryKey);
            if (!hasOwn(set, key)) {
              set[key] = true;
              fn(item, cursor, advance);
            }
          }
        }
        ctx.or._iterate(union, resolveboth, reject, idbstore);
        iterate(openCursor(ctx, idbstore), ctx.algorithm, union, resolveboth, reject, !ctx.keysOnly && ctx.valueMapper);
      })();
    }
    return {
      //
      // Collection Protected Functions
      //
      _read: function (fn, cb) {
        var ctx = this._ctx;
        return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._idbstore(READONLY, fn).then(cb);
      },
      _write: function (fn) {
        var ctx = this._ctx;
        return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._idbstore(READWRITE, fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
      },

      _addAlgorithm: function (fn) {
        var ctx = this._ctx;
        ctx.algorithm = combine(ctx.algorithm, fn);
      },
      _iterate: function (fn, resolve, reject, idbstore) {
        return iter(this._ctx, fn, resolve, reject, idbstore);
      },
      clone: function (props$$1) {
        var rv = Object.create(this.constructor.prototype),
          ctx = Object.create(this._ctx);
        if (props$$1) extend(ctx, props$$1);
        rv._ctx = ctx;
        return rv;
      },
      raw: function () {
        this._ctx.valueMapper = null;
        return this;
      },
      //
      // Collection Public methods
      //
      each: function (fn) {
        var ctx = this._ctx;
        return this._read(function (resolve, reject, idbstore) {
          iter(ctx, fn, resolve, reject, idbstore);
        });
      },
      count: function (cb) {
        var ctx = this._ctx;
        if (isPlainKeyRange(ctx, true)) {
          // This is a plain key range. We can use the count() method if the index.
          return this._read(function (resolve, reject, idbstore) {
            var idx = getIndexOrStore(ctx, idbstore);
            var req = ctx.range ? idx.count(ctx.range) : idx.count();
            req.onerror = eventRejectHandler(reject);
            req.onsuccess = function (e) {
              resolve(Math.min(e.target.result, ctx.limit));
            };
          }, cb);
        } else {
          // Algorithms, filters or expressions are applied. Need to count manually.
          var count = 0;
          return this._read(function (resolve, reject, idbstore) {
            iter(ctx, function () {
              ++count;
              return false;
            }, function () {
              resolve(count);
            }, reject, idbstore);
          }, cb);
        }
      },
      sortBy: function (keyPath, cb) {
        /// <param name="keyPath" type="String"></param>
        var parts = keyPath.split('.').reverse(),
          lastPart = parts[0],
          lastIndex = parts.length - 1;
        function getval(obj, i) {
          if (i) return getval(obj[parts[i]], i - 1);
          return obj[lastPart];
        }
        var order = this._ctx.dir === "next" ? 1 : -1;
        function sorter(a, b) {
          var aVal = getval(a, lastIndex),
            bVal = getval(b, lastIndex);
          return aVal < bVal ? -order : aVal > bVal ? order : 0;
        }
        return this.toArray(function (a) {
          return a.sort(sorter);
        }).then(cb);
      },
      toArray: function (cb) {
        var ctx = this._ctx;
        return this._read(function (resolve, reject, idbstore) {
          if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
            // Special optimation if we could use IDBObjectStore.getAll() or
            // IDBKeyRange.getAll():
            var readingHook = ctx.table.hook.reading.fire;
            var idxOrStore = getIndexOrStore(ctx, idbstore);
            var req = ctx.limit < Infinity ? idxOrStore.getAll(ctx.range, ctx.limit) : idxOrStore.getAll(ctx.range);
            req.onerror = eventRejectHandler(reject);
            req.onsuccess = readingHook === mirror ? eventSuccessHandler(resolve) : eventSuccessHandler(function (res) {
              try {
                resolve(res.map(readingHook));
              } catch (e) {
                reject(e);
              }
            });
          } else {
            // Getting array through a cursor.
            var a = [];
            iter(ctx, function (item) {
              a.push(item);
            }, function arrayComplete() {
              resolve(a);
            }, reject, idbstore);
          }
        }, cb);
      },
      offset: function (offset) {
        var ctx = this._ctx;
        if (offset <= 0) return this;
        ctx.offset += offset; // For count()
        if (isPlainKeyRange(ctx)) {
          addReplayFilter(ctx, function () {
            var offsetLeft = offset;
            return function (cursor, advance) {
              if (offsetLeft === 0) return true;
              if (offsetLeft === 1) {
                --offsetLeft;
                return false;
              }
              advance(function () {
                cursor.advance(offsetLeft);
                offsetLeft = 0;
              });
              return false;
            };
          });
        } else {
          addReplayFilter(ctx, function () {
            var offsetLeft = offset;
            return function () {
              return --offsetLeft < 0;
            };
          });
        }
        return this;
      },
      limit: function (numRows) {
        this._ctx.limit = Math.min(this._ctx.limit, numRows); // For count()
        addReplayFilter(this._ctx, function () {
          var rowsLeft = numRows;
          return function (cursor, advance, resolve) {
            if (--rowsLeft <= 0) advance(resolve); // Stop after this item has been included
            return rowsLeft >= 0; // If numRows is already below 0, return false because then 0 was passed to numRows initially. Otherwise we wouldnt come here.
          };
        }, true);
        return this;
      },
      until: function (filterFunction, bIncludeStopEntry) {
        addFilter(this._ctx, function (cursor, advance, resolve) {
          if (filterFunction(cursor.value)) {
            advance(resolve);
            return bIncludeStopEntry;
          } else {
            return true;
          }
        });
        return this;
      },
      first: function (cb) {
        return this.limit(1).toArray(function (a) {
          return a[0];
        }).then(cb);
      },
      last: function (cb) {
        return this.reverse().first(cb);
      },
      filter: function (filterFunction) {
        /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
        addFilter(this._ctx, function (cursor) {
          return filterFunction(cursor.value);
        });
        // match filters not used in Dexie.js but can be used by 3rd part libraries to test a
        // collection for a match without querying DB. Used by Dexie.Observable.
        addMatchFilter(this._ctx, filterFunction);
        return this;
      },
      and: function (filterFunction) {
        return this.filter(filterFunction);
      },
      or: function (indexName) {
        return new WhereClause(this._ctx.table, indexName, this);
      },
      reverse: function () {
        this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
        if (this._ondirectionchange) this._ondirectionchange(this._ctx.dir);
        return this;
      },
      desc: function () {
        return this.reverse();
      },
      eachKey: function (cb) {
        var ctx = this._ctx;
        ctx.keysOnly = !ctx.isMatch;
        return this.each(function (val, cursor) {
          cb(cursor.key, cursor);
        });
      },
      eachUniqueKey: function (cb) {
        this._ctx.unique = "unique";
        return this.eachKey(cb);
      },
      eachPrimaryKey: function (cb) {
        var ctx = this._ctx;
        ctx.keysOnly = !ctx.isMatch;
        return this.each(function (val, cursor) {
          cb(cursor.primaryKey, cursor);
        });
      },
      keys: function (cb) {
        var ctx = this._ctx;
        ctx.keysOnly = !ctx.isMatch;
        var a = [];
        return this.each(function (item, cursor) {
          a.push(cursor.key);
        }).then(function () {
          return a;
        }).then(cb);
      },
      primaryKeys: function (cb) {
        var ctx = this._ctx;
        if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
          // Special optimation if we could use IDBObjectStore.getAllKeys() or
          // IDBKeyRange.getAllKeys():
          return this._read(function (resolve, reject, idbstore) {
            var idxOrStore = getIndexOrStore(ctx, idbstore);
            var req = ctx.limit < Infinity ? idxOrStore.getAllKeys(ctx.range, ctx.limit) : idxOrStore.getAllKeys(ctx.range);
            req.onerror = eventRejectHandler(reject);
            req.onsuccess = eventSuccessHandler(resolve);
          }).then(cb);
        }
        ctx.keysOnly = !ctx.isMatch;
        var a = [];
        return this.each(function (item, cursor) {
          a.push(cursor.primaryKey);
        }).then(function () {
          return a;
        }).then(cb);
      },
      uniqueKeys: function (cb) {
        this._ctx.unique = "unique";
        return this.keys(cb);
      },
      firstKey: function (cb) {
        return this.limit(1).keys(function (a) {
          return a[0];
        }).then(cb);
      },
      lastKey: function (cb) {
        return this.reverse().firstKey(cb);
      },
      distinct: function () {
        var ctx = this._ctx,
          idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
        if (!idx || !idx.multi) return this; // distinct() only makes differencies on multiEntry indexes.
        var set = {};
        addFilter(this._ctx, function (cursor) {
          var strKey = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
          var found = hasOwn(set, strKey);
          set[strKey] = true;
          return !found;
        });
        return this;
      },
      //
      // Methods that mutate storage
      //
      modify: function (changes) {
        var self = this,
          ctx = this._ctx,
          hook = ctx.table.hook,
          updatingHook = hook.updating.fire,
          deletingHook = hook.deleting.fire;
        return this._write(function (resolve, reject, idbstore, trans) {
          var modifyer;
          if (typeof changes === 'function') {
            // Changes is a function that may update, add or delete propterties or even require a deletion the object itself (delete this.item)
            if (updatingHook === nop && deletingHook === nop) {
              // Noone cares about what is being changed. Just let the modifier function be the given argument as is.
              modifyer = changes;
            } else {
              // People want to know exactly what is being modified or deleted.
              // Let modifyer be a proxy function that finds out what changes the caller is actually doing
              // and call the hooks accordingly!
              modifyer = function (item) {
                var origItem = deepClone(item); // Clone the item first so we can compare laters.
                if (changes.call(this, item, this) === false) return false; // Call the real modifyer function (If it returns false explicitely, it means it dont want to modify anyting on this object)
                if (!hasOwn(this, "value")) {
                  // The real modifyer function requests a deletion of the object. Inform the deletingHook that a deletion is taking place.
                  deletingHook.call(this, this.primKey, item, trans);
                } else {
                  // No deletion. Check what was changed
                  var objectDiff = getObjectDiff(origItem, this.value);
                  var additionalChanges = updatingHook.call(this, objectDiff, this.primKey, origItem, trans);
                  if (additionalChanges) {
                    // Hook want to apply additional modifications. Make sure to fullfill the will of the hook.
                    item = this.value;
                    keys(additionalChanges).forEach(function (keyPath) {
                      setByKeyPath(item, keyPath, additionalChanges[keyPath]); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                    });
                  }
                }
              };
            }
          } else if (updatingHook === nop) {
            // changes is a set of {keyPath: value} and no one is listening to the updating hook.
            var keyPaths = keys(changes);
            var numKeys = keyPaths.length;
            modifyer = function (item) {
              var anythingModified = false;
              for (var i = 0; i < numKeys; ++i) {
                var keyPath = keyPaths[i],
                  val = changes[keyPath];
                if (getByKeyPath(item, keyPath) !== val) {
                  setByKeyPath(item, keyPath, val); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                  anythingModified = true;
                }
              }
              return anythingModified;
            };
          } else {
            // changes is a set of {keyPath: value} and people are listening to the updating hook so we need to call it and
            // allow it to add additional modifications to make.
            var origChanges = changes;
            changes = shallowClone(origChanges); // Let's work with a clone of the changes keyPath/value set so that we can restore it in case a hook extends it.
            modifyer = function (item) {
              var anythingModified = false;
              var additionalChanges = updatingHook.call(this, changes, this.primKey, deepClone(item), trans);
              if (additionalChanges) extend(changes, additionalChanges);
              keys(changes).forEach(function (keyPath) {
                var val = changes[keyPath];
                if (getByKeyPath(item, keyPath) !== val) {
                  setByKeyPath(item, keyPath, val);
                  anythingModified = true;
                }
              });
              if (additionalChanges) changes = shallowClone(origChanges); // Restore original changes for next iteration
              return anythingModified;
            };
          }
          var count = 0;
          var successCount = 0;
          var iterationComplete = false;
          var failures = [];
          var failKeys = [];
          var currentKey = null;
          function modifyItem(item, cursor) {
            currentKey = cursor.primaryKey;
            var thisContext = {
              primKey: cursor.primaryKey,
              value: item,
              onsuccess: null,
              onerror: null
            };
            function onerror(e) {
              failures.push(e);
              failKeys.push(thisContext.primKey);
              checkFinished();
              return true; // Catch these errors and let a final rejection decide whether or not to abort entire transaction
            }

            if (modifyer.call(thisContext, item, thisContext) !== false) {
              var bDelete = !hasOwn(thisContext, "value");
              ++count;
              tryCatch(function () {
                var req = bDelete ? cursor.delete() : cursor.update(thisContext.value);
                req._hookCtx = thisContext;
                req.onerror = hookedEventRejectHandler(onerror);
                req.onsuccess = hookedEventSuccessHandler(function () {
                  ++successCount;
                  checkFinished();
                });
              }, onerror);
            } else if (thisContext.onsuccess) {
              // Hook will expect either onerror or onsuccess to always be called!
              thisContext.onsuccess(thisContext.value);
            }
          }
          function doReject(e) {
            if (e) {
              failures.push(e);
              failKeys.push(currentKey);
            }
            return reject(new ModifyError("Error modifying one or more objects", failures, successCount, failKeys));
          }
          function checkFinished() {
            if (iterationComplete && successCount + failures.length === count) {
              if (failures.length > 0) doReject();else resolve(successCount);
            }
          }
          self.clone().raw()._iterate(modifyItem, function () {
            iterationComplete = true;
            checkFinished();
          }, doReject, idbstore);
        });
      },
      'delete': function () {
        var _this = this;
        var ctx = this._ctx,
          range = ctx.range,
          deletingHook = ctx.table.hook.deleting.fire,
          hasDeleteHook = deletingHook !== nop;
        if (!hasDeleteHook && isPlainKeyRange(ctx) && (ctx.isPrimKey && !hangsOnDeleteLargeKeyRange || !range)) {
          // May use IDBObjectStore.delete(IDBKeyRange) in this case (Issue #208)
          // For chromium, this is the way most optimized version.
          // For IE/Edge, this could hang the indexedDB engine and make operating system instable
          // (https://gist.github.com/dfahlander/5a39328f029de18222cf2125d56c38f7)
          return this._write(function (resolve, reject, idbstore) {
            // Our API contract is to return a count of deleted items, so we have to count() before delete().
            var onerror = eventRejectHandler(reject),
              countReq = range ? idbstore.count(range) : idbstore.count();
            countReq.onerror = onerror;
            countReq.onsuccess = function () {
              var count = countReq.result;
              tryCatch(function () {
                var delReq = range ? idbstore.delete(range) : idbstore.clear();
                delReq.onerror = onerror;
                delReq.onsuccess = function () {
                  return resolve(count);
                };
              }, function (err) {
                return reject(err);
              });
            };
          });
        }
        // Default version to use when collection is not a vanilla IDBKeyRange on the primary key.
        // Divide into chunks to not starve RAM.
        // If has delete hook, we will have to collect not just keys but also objects, so it will use
        // more memory and need lower chunk size.
        var CHUNKSIZE = hasDeleteHook ? 2000 : 10000;
        return this._write(function (resolve, reject, idbstore, trans) {
          var totalCount = 0;
          // Clone collection and change its table and set a limit of CHUNKSIZE on the cloned Collection instance.
          var collection = _this.clone({
            keysOnly: !ctx.isMatch && !hasDeleteHook
          }) // load just keys (unless filter() or and() or deleteHook has subscribers)
          .distinct() // In case multiEntry is used, never delete same key twice because resulting count
          .limit(CHUNKSIZE).raw(); // Don't filter through reading-hooks (like mapped classes etc)
          var keysOrTuples = [];
          // We're gonna do things on as many chunks that are needed.
          // Use recursion of nextChunk function:
          var nextChunk = function () {
            return collection.each(hasDeleteHook ? function (val, cursor) {
              // Somebody subscribes to hook('deleting'). Collect all primary keys and their values,
              // so that the hook can be called with its values in bulkDelete().
              keysOrTuples.push([cursor.primaryKey, cursor.value]);
            } : function (val, cursor) {
              // No one subscribes to hook('deleting'). Collect only primary keys:
              keysOrTuples.push(cursor.primaryKey);
            }).then(function () {
              // Chromium deletes faster when doing it in sort order.
              hasDeleteHook ? keysOrTuples.sort(function (a, b) {
                return ascending(a[0], b[0]);
              }) : keysOrTuples.sort(ascending);
              return bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook);
            }).then(function () {
              var count = keysOrTuples.length;
              totalCount += count;
              keysOrTuples = [];
              return count < CHUNKSIZE ? totalCount : nextChunk();
            });
          };
          resolve(nextChunk());
        });
      }
    };
  });
  //
  //
  //
  // ------------------------- Help functions ---------------------------
  //
  //
  //
  function lowerVersionFirst(a, b) {
    return a._cfg.version - b._cfg.version;
  }
  function setApiOnPlace(objs, tableNames, dbschema) {
    tableNames.forEach(function (tableName) {
      var schema = dbschema[tableName];
      objs.forEach(function (obj) {
        if (!(tableName in obj)) {
          if (obj === Transaction.prototype || obj instanceof Transaction) {
            // obj is a Transaction prototype (or prototype of a subclass to Transaction)
            // Make the API a getter that returns this.table(tableName)
            setProp(obj, tableName, {
              get: function () {
                return this.table(tableName);
              }
            });
          } else {
            // Table will not be bound to a transaction (will use Dexie.currentTransaction)
            obj[tableName] = new Table(tableName, schema);
          }
        }
      });
    });
  }
  function removeTablesApi(objs) {
    objs.forEach(function (obj) {
      for (var key in obj) {
        if (obj[key] instanceof Table) delete obj[key];
      }
    });
  }
  function iterate(req, filter, fn, resolve, reject, valueMapper) {
    // Apply valueMapper (hook('reading') or mappped class)
    var mappedFn = valueMapper ? function (x, c, a) {
      return fn(valueMapper(x), c, a);
    } : fn;
    // Wrap fn with PSD and microtick stuff from Promise.
    var wrappedFn = wrap(mappedFn, reject);
    if (!req.onerror) req.onerror = eventRejectHandler(reject);
    if (filter) {
      req.onsuccess = trycatcher(function filter_record() {
        var cursor = req.result;
        if (cursor) {
          var c = function () {
            cursor.continue();
          };
          if (filter(cursor, function (advancer) {
            c = advancer;
          }, resolve, reject)) wrappedFn(cursor.value, cursor, function (advancer) {
            c = advancer;
          });
          c();
        } else {
          resolve();
        }
      }, reject);
    } else {
      req.onsuccess = trycatcher(function filter_record() {
        var cursor = req.result;
        if (cursor) {
          var c = function () {
            cursor.continue();
          };
          wrappedFn(cursor.value, cursor, function (advancer) {
            c = advancer;
          });
          c();
        } else {
          resolve();
        }
      }, reject);
    }
  }
  function parseIndexSyntax(indexes) {
    /// <param name="indexes" type="String"></param>
    /// <returns type="Array" elementType="IndexSpec"></returns>
    var rv = [];
    indexes.split(',').forEach(function (index) {
      index = index.trim();
      var name = index.replace(/([&*]|\+\+)/g, ""); // Remove "&", "++" and "*"
      // Let keyPath of "[a+b]" be ["a","b"]:
      var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;
      rv.push(new IndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), /\./.test(index)));
    });
    return rv;
  }
  function cmp(key1, key2) {
    return indexedDB.cmp(key1, key2);
  }
  function min(a, b) {
    return cmp(a, b) < 0 ? a : b;
  }
  function max(a, b) {
    return cmp(a, b) > 0 ? a : b;
  }
  function ascending(a, b) {
    return indexedDB.cmp(a, b);
  }
  function descending(a, b) {
    return indexedDB.cmp(b, a);
  }
  function simpleCompare(a, b) {
    return a < b ? -1 : a === b ? 0 : 1;
  }
  function simpleCompareReverse(a, b) {
    return a > b ? -1 : a === b ? 0 : 1;
  }
  function combine(filter1, filter2) {
    return filter1 ? filter2 ? function () {
      return filter1.apply(this, arguments) && filter2.apply(this, arguments);
    } : filter1 : filter2;
  }
  function readGlobalSchema() {
    db.verno = idbdb.version / 10;
    db._dbSchema = globalSchema = {};
    dbStoreNames = slice(idbdb.objectStoreNames, 0);
    if (dbStoreNames.length === 0) return; // Database contains no stores.
    var trans = idbdb.transaction(safariMultiStoreFix(dbStoreNames), 'readonly');
    dbStoreNames.forEach(function (storeName) {
      var store = trans.objectStore(storeName),
        keyPath = store.keyPath,
        dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
      var primKey = new IndexSpec(keyPath, keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== 'string', dotted);
      var indexes = [];
      for (var j = 0; j < store.indexNames.length; ++j) {
        var idbindex = store.index(store.indexNames[j]);
        keyPath = idbindex.keyPath;
        dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
        var index = new IndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== 'string', dotted);
        indexes.push(index);
      }
      globalSchema[storeName] = new TableSchema(storeName, primKey, indexes, {});
    });
    setApiOnPlace([allTables], keys(globalSchema), globalSchema);
  }
  function adjustToExistingIndexNames(schema, idbtrans) {
    /// <summary>
    /// Issue #30 Problem with existing db - adjust to existing index names when migrating from non-dexie db
    /// </summary>
    /// <param name="schema" type="Object">Map between name and TableSchema</param>
    /// <param name="idbtrans" type="IDBTransaction"></param>
    var storeNames = idbtrans.db.objectStoreNames;
    for (var i = 0; i < storeNames.length; ++i) {
      var storeName = storeNames[i];
      var store = idbtrans.objectStore(storeName);
      hasGetAll = 'getAll' in store;
      for (var j = 0; j < store.indexNames.length; ++j) {
        var indexName = store.indexNames[j];
        var keyPath = store.index(indexName).keyPath;
        var dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
        if (schema[storeName]) {
          var indexSpec = schema[storeName].idxByName[dexieName];
          if (indexSpec) indexSpec.name = indexName;
        }
      }
    }
    // Bug with getAll() on Safari ver<604 on Workers only, see discussion following PR #579
    if (/Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
      hasGetAll = false;
    }
  }
  function fireOnBlocked(ev) {
    db.on("blocked").fire(ev);
    // Workaround (not fully*) for missing "versionchange" event in IE,Edge and Safari:
    connections.filter(function (c) {
      return c.name === db.name && c !== db && !c._vcFired;
    }).map(function (c) {
      return c.on("versionchange").fire(ev);
    });
  }
  extend(this, {
    Collection: Collection,
    Table: Table,
    Transaction: Transaction,
    Version: Version,
    WhereClause: WhereClause
  });
  init();
  addons.forEach(function (fn) {
    fn(db);
  });
}
function parseType(type) {
  if (typeof type === 'function') {
    return new type();
  } else if (isArray(type)) {
    return [parseType(type[0])];
  } else if (type && typeof type === 'object') {
    var rv = {};
    applyStructure(rv, type);
    return rv;
  } else {
    return type;
  }
}
function applyStructure(obj, structure) {
  keys(structure).forEach(function (member) {
    var value = parseType(structure[member]);
    obj[member] = value;
  });
  return obj;
}
function hookedEventSuccessHandler(resolve) {
  // wrap() is needed when calling hooks because the rare scenario of:
  //  * hook does a db operation that fails immediately (IDB throws exception)
  //    For calling db operations on correct transaction, wrap makes sure to set PSD correctly.
  //    wrap() will also execute in a virtual tick.
  //  * If not wrapped in a virtual tick, direct exception will launch a new physical tick.
  //  * If this was the last event in the bulk, the promise will resolve after a physical tick
  //    and the transaction will have committed already.
  // If no hook, the virtual tick will be executed in the reject()/resolve of the final promise,
  // because it is always marked with _lib = true when created using Transaction._promise().
  return wrap(function (event) {
    var req = event.target,
      ctx = req._hookCtx,
      // Contains the hook error handler. Put here instead of closure to boost performance.
      result = ctx.value || req.result,
      // Pass the object value on updates. The result from IDB is the primary key.
      hookSuccessHandler = ctx && ctx.onsuccess;
    hookSuccessHandler && hookSuccessHandler(result);
    resolve && resolve(result);
  }, resolve);
}
function eventRejectHandler(reject) {
  return wrap(function (event) {
    preventDefault(event);
    reject(event.target.error);
    return false;
  });
}
function eventSuccessHandler(resolve) {
  return wrap(function (event) {
    resolve(event.target.result);
  });
}
function hookedEventRejectHandler(reject) {
  return wrap(function (event) {
    // See comment on hookedEventSuccessHandler() why wrap() is needed only when supporting hooks.
    var req = event.target,
      err = req.error,
      ctx = req._hookCtx,
      // Contains the hook error handler. Put here instead of closure to boost performance.
      hookErrorHandler = ctx && ctx.onerror;
    hookErrorHandler && hookErrorHandler(err);
    preventDefault(event);
    reject(err);
    return false;
  });
}
function preventDefault(event) {
  if (event.stopPropagation) event.stopPropagation();
  if (event.preventDefault) event.preventDefault();
}
function awaitIterator(iterator) {
  var callNext = function (result) {
      return iterator.next(result);
    },
    doThrow = function (error) {
      return iterator.throw(error);
    },
    onSuccess = step(callNext),
    onError = step(doThrow);
  function step(getNext) {
    return function (val) {
      var next = getNext(val),
        value = next.value;
      return next.done ? value : !value || typeof value.then !== 'function' ? isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
    };
  }
  return step(callNext)();
}
//
// IndexSpec struct
//
function IndexSpec(name, keyPath, unique, multi, auto, compound, dotted) {
  /// <param name="name" type="String"></param>
  /// <param name="keyPath" type="String"></param>
  /// <param name="unique" type="Boolean"></param>
  /// <param name="multi" type="Boolean"></param>
  /// <param name="auto" type="Boolean"></param>
  /// <param name="compound" type="Boolean"></param>
  /// <param name="dotted" type="Boolean"></param>
  this.name = name;
  this.keyPath = keyPath;
  this.unique = unique;
  this.multi = multi;
  this.auto = auto;
  this.compound = compound;
  this.dotted = dotted;
  var keyPathSrc = typeof keyPath === 'string' ? keyPath : keyPath && '[' + [].join.call(keyPath, '+') + ']';
  this.src = (unique ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + keyPathSrc;
}
//
// TableSchema struct
//
function TableSchema(name, primKey, indexes, instanceTemplate) {
  /// <param name="name" type="String"></param>
  /// <param name="primKey" type="IndexSpec"></param>
  /// <param name="indexes" type="Array" elementType="IndexSpec"></param>
  /// <param name="instanceTemplate" type="Object"></param>
  this.name = name;
  this.primKey = primKey || new IndexSpec();
  this.indexes = indexes || [new IndexSpec()];
  this.instanceTemplate = instanceTemplate;
  this.mappedClass = null;
  this.idxByName = arrayToObject(indexes, function (index) {
    return [index.name, index];
  });
}
function safariMultiStoreFix(storeNames) {
  return storeNames.length === 1 ? storeNames[0] : storeNames;
}
function getNativeGetDatabaseNamesFn(indexedDB) {
  var fn = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
  return fn && fn.bind(indexedDB);
}
// Export Error classes
props(Dexie, fullNameExceptions); // Dexie.XXXError = class XXXError {...};
//
// Static methods and properties
// 
props(Dexie, {
  //
  // Static delete() method.
  //
  delete: function (databaseName) {
    var db = new Dexie(databaseName),
      promise = db.delete();
    promise.onblocked = function (fn) {
      db.on("blocked", fn);
      return this;
    };
    return promise;
  },
  //
  // Static exists() method.
  //
  exists: function (name) {
    return new Dexie(name).open().then(function (db) {
      db.close();
      return true;
    }).catch(Dexie.NoSuchDatabaseError, function () {
      return false;
    });
  },
  //
  // Static method for retrieving a list of all existing databases at current host.
  //
  getDatabaseNames: function (cb) {
    var getDatabaseNames = getNativeGetDatabaseNamesFn(Dexie.dependencies.indexedDB);
    return getDatabaseNames ? new Promise(function (resolve, reject) {
      var req = getDatabaseNames();
      req.onsuccess = function (event) {
        resolve(slice(event.target.result, 0)); // Converst DOMStringList to Array<String>
      };

      req.onerror = eventRejectHandler(reject);
    }).then(cb) : dbNamesDB.dbnames.toCollection().primaryKeys(cb);
  },
  defineClass: function () {
    // Default constructor able to copy given properties into this object.
    function Class(properties) {
      /// <param name="properties" type="Object" optional="true">Properties to initialize object with.
      /// </param>
      if (properties) extend(this, properties);
    }
    return Class;
  },
  applyStructure: applyStructure,
  ignoreTransaction: function (scopeFunc) {
    // In case caller is within a transaction but needs to create a separate transaction.
    // Example of usage:
    //
    // Let's say we have a logger function in our app. Other application-logic should be unaware of the
    // logger function and not need to include the 'logentries' table in all transaction it performs.
    // The logging should always be done in a separate transaction and not be dependant on the current
    // running transaction context. Then you could use Dexie.ignoreTransaction() to run code that starts a new transaction.
    //
    //     Dexie.ignoreTransaction(function() {
    //         db.logentries.add(newLogEntry);
    //     });
    //
    // Unless using Dexie.ignoreTransaction(), the above example would try to reuse the current transaction
    // in current Promise-scope.
    //
    // An alternative to Dexie.ignoreTransaction() would be setImmediate() or setTimeout(). The reason we still provide an
    // API for this because
    //  1) The intention of writing the statement could be unclear if using setImmediate() or setTimeout().
    //  2) setTimeout() would wait unnescessary until firing. This is however not the case with setImmediate().
    //  3) setImmediate() is not supported in the ES standard.
    //  4) You might want to keep other PSD state that was set in a parent PSD, such as PSD.letThrough.
    return PSD.trans ? usePSD(PSD.transless, scopeFunc) :
    // Use the closest parent that was non-transactional.
    scopeFunc(); // No need to change scope because there is no ongoing transaction.
  },

  vip: function (fn) {
    // To be used by subscribers to the on('ready') event.
    // This will let caller through to access DB even when it is blocked while the db.ready() subscribers are firing.
    // This would have worked automatically if we were certain that the Provider was using Dexie.Promise for all asyncronic operations. The promise PSD
    // from the provider.connect() call would then be derived all the way to when provider would call localDatabase.applyChanges(). But since
    // the provider more likely is using non-promise async APIs or other thenable implementations, we cannot assume that.
    // Note that this method is only useful for on('ready') subscribers that is returning a Promise from the event. If not using vip()
    // the database could deadlock since it wont open until the returned Promise is resolved, and any non-VIPed operation started by
    // the caller will not resolve until database is opened.
    return newScope(function () {
      PSD.letThrough = true; // Make sure we are let through if still blocking db due to onready is firing.
      return fn();
    });
  },
  async: function (generatorFn) {
    return function () {
      try {
        var rv = awaitIterator(generatorFn.apply(this, arguments));
        if (!rv || typeof rv.then !== 'function') return Promise.resolve(rv);
        return rv;
      } catch (e) {
        return rejection(e);
      }
    };
  },
  spawn: function (generatorFn, args, thiz) {
    try {
      var rv = awaitIterator(generatorFn.apply(thiz, args || []));
      if (!rv || typeof rv.then !== 'function') return Promise.resolve(rv);
      return rv;
    } catch (e) {
      return rejection(e);
    }
  },
  // Dexie.currentTransaction property
  currentTransaction: {
    get: function () {
      return PSD.trans || null;
    }
  },
  waitFor: function (promiseOrFunction, optionalTimeout) {
    // If a function is provided, invoke it and pass the returning value to Transaction.waitFor()
    var promise = Promise.resolve(typeof promiseOrFunction === 'function' ? Dexie.ignoreTransaction(promiseOrFunction) : promiseOrFunction).timeout(optionalTimeout || 60000); // Default the timeout to one minute. Caller may specify Infinity if required.       
    // Run given promise on current transaction. If no current transaction, just return a Dexie promise based
    // on given value.
    return PSD.trans ? PSD.trans.waitFor(promise) : promise;
  },
  // Export our Promise implementation since it can be handy as a standalone Promise implementation
  Promise: Promise,
  // Dexie.debug proptery:
  // Dexie.debug = false
  // Dexie.debug = true
  // Dexie.debug = "dexie" - don't hide dexie's stack frames.
  debug: {
    get: function () {
      return debug;
    },
    set: function (value) {
      setDebug(value, value === 'dexie' ? function () {
        return true;
      } : dexieStackFrameFilter);
    }
  },
  // Export our derive/extend/override methodology
  derive: derive,
  extend: extend,
  props: props,
  override: override,
  // Export our Events() function - can be handy as a toolkit
  Events: Events,
  // Utilities
  getByKeyPath: getByKeyPath,
  setByKeyPath: setByKeyPath,
  delByKeyPath: delByKeyPath,
  shallowClone: shallowClone,
  deepClone: deepClone,
  getObjectDiff: getObjectDiff,
  asap: asap,
  maxKey: maxKey,
  minKey: minKey,
  // Addon registry
  addons: [],
  // Global DB connection list
  connections: connections,
  MultiModifyError: exceptions.Modify,
  errnames: errnames,
  // Export other static classes
  IndexSpec: IndexSpec,
  TableSchema: TableSchema,
  //
  // Dependencies
  //
  // These will automatically work in browsers with indexedDB support, or where an indexedDB polyfill has been included.
  //
  // In node.js, however, these properties must be set "manually" before instansiating a new Dexie().
  // For node.js, you need to require indexeddb-js or similar and then set these deps.
  //
  dependencies: function () {
    try {
      return {
        // Required:
        indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
        IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
      };
    } catch (e) {
      return {
        indexedDB: null,
        IDBKeyRange: null
      };
    }
  }(),
  // API Version Number: Type Number, make sure to always set a version number that can be comparable correctly. Example: 0.9, 0.91, 0.92, 1.0, 1.01, 1.1, 1.2, 1.21, etc.
  semVer: DEXIE_VERSION,
  version: DEXIE_VERSION.split('.').map(function (n) {
    return parseInt(n);
  }).reduce(function (p, c, i) {
    return p + c / Math.pow(10, i * 2);
  }),
  // https://github.com/dfahlander/Dexie.js/issues/186
  // typescript compiler tsc in mode ts-->es5 & commonJS, will expect require() to return
  // x.default. Workaround: Set Dexie.default = Dexie.
  default: Dexie,
  // Make it possible to import {Dexie} (non-default import)
  // Reason 1: May switch to that in future.
  // Reason 2: We declare it both default and named exported in d.ts to make it possible
  // to let addons extend the Dexie interface with Typescript 2.1 (works only when explicitely
  // exporting the symbol, not just default exporting)
  Dexie: Dexie
});
// Map DOMErrors and DOMExceptions to corresponding Dexie errors. May change in Dexie v2.0.
Promise.rejectionMapper = mapError;
// Initialize dbNamesDB (won't ever be opened on chromium browsers')
dbNamesDB = new Dexie('__dbnames');
dbNamesDB.version(1).stores({
  dbnames: 'name'
});
(function () {
  // Migrate from Dexie 1.x database names stored in localStorage:
  var DBNAMES = 'Dexie.DatabaseNames';
  try {
    if (typeof localStorage !== undefined && _global.document !== undefined) {
      // Have localStorage and is not executing in a worker. Lets migrate from Dexie 1.x.
      JSON.parse(localStorage.getItem(DBNAMES) || "[]").forEach(function (name) {
        return dbNamesDB.dbnames.put({
          name: name
        }).catch(nop);
      });
      localStorage.removeItem(DBNAMES);
    }
  } catch (_e) {}
})();
var _default = Dexie;
exports.default = _default;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)
},{"timers":2}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Zlib = exports.ZipPassThrough = exports.ZipDeflate = exports.Zip = exports.Unzlib = exports.UnzipPassThrough = exports.UnzipInflate = exports.Unzip = exports.Inflate = exports.Gzip = exports.Gunzip = exports.FlateErrorCode = exports.EncodeUTF8 = exports.Deflate = exports.Decompress = exports.DecodeUTF8 = exports.Compress = exports.AsyncZlib = exports.AsyncZipDeflate = exports.AsyncUnzlib = exports.AsyncUnzipInflate = exports.AsyncInflate = exports.AsyncGzip = exports.AsyncGunzip = exports.AsyncDeflate = exports.AsyncDecompress = exports.AsyncCompress = void 0;
exports.gzip = exports.compress = Nr;
exports.gzipSync = exports.compressSync = Nn;
exports.decompress = st;
exports.decompressSync = ut;
exports.default = void 0;
exports.deflate = qr;
exports.deflateSync = Bn;
exports.gunzip = Wr;
exports.gunzipSync = Wn;
exports.inflate = fr;
exports.inflateSync = Mn;
exports.strFromU8 = lr;
exports.strToU8 = sn;
exports.unzip = xt;
exports.unzipSync = At;
exports.unzlib = jr;
exports.unzlibSync = jn;
exports.zip = gt;
exports.zipSync = yt;
exports.zlib = ot;
exports.zlibSync = ur;
var wr = {},
  tt = function (r, n, t, e, i) {
    var a = new Worker(wr[n] || (wr[n] = URL.createObjectURL(new Blob([r + ';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})'], {
      type: "text/javascript"
    }))));
    return a.onmessage = function (o) {
      var s = o.data,
        u = s.$e$;
      if (u) {
        var f = new Error(u[0]);
        f.code = u[1], f.stack = u[2], i(f, null);
      } else i(null, s);
    }, a.postMessage(t, e), a;
  },
  D = Uint8Array,
  $ = Uint16Array,
  an = Uint32Array,
  ln = new D([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]),
  cn = new D([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]),
  Cn = new D([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]),
  mr = function (r, n) {
    for (var t = new $(31), e = 0; e < 31; ++e) t[e] = n += 1 << r[e - 1];
    for (var i = new an(t[30]), e = 1; e < 30; ++e) for (var a = t[e]; a < t[e + 1]; ++a) i[a] = a - t[e] << 5 | e;
    return [t, i];
  },
  zr = mr(ln, 2),
  Qn = zr[0],
  kn = zr[1];
Qn[28] = 258, kn[258] = 28;
for (var xr = mr(cn, 0), Ar = xr[0], Vn = xr[1], Sn = new $(32768), G = 0; G < 32768; ++G) {
  var on = (G & 43690) >>> 1 | (G & 21845) << 1;
  on = (on & 52428) >>> 2 | (on & 13107) << 2, on = (on & 61680) >>> 4 | (on & 3855) << 4, Sn[G] = ((on & 65280) >>> 8 | (on & 255) << 8) >>> 1;
}
for (var Q = function (r, n, t) {
    for (var e = r.length, i = 0, a = new $(n); i < e; ++i) ++a[r[i] - 1];
    var o = new $(n);
    for (i = 0; i < n; ++i) o[i] = o[i - 1] + a[i - 1] << 1;
    var s;
    if (t) {
      s = new $(1 << n);
      var u = 15 - n;
      for (i = 0; i < e; ++i) if (r[i]) for (var f = i << 4 | r[i], h = n - r[i], l = o[r[i] - 1]++ << h, g = l | (1 << h) - 1; l <= g; ++l) s[Sn[l] >>> u] = f;
    } else for (s = new $(e), i = 0; i < e; ++i) r[i] && (s[i] = Sn[o[r[i] - 1]++] >>> 15 - r[i]);
    return s;
  }, tn = new D(288), G = 0; G < 144; ++G) tn[G] = 8;
for (var G = 144; G < 256; ++G) tn[G] = 9;
for (var G = 256; G < 280; ++G) tn[G] = 7;
for (var G = 280; G < 288; ++G) tn[G] = 8;
for (var pn = new D(32), G = 0; G < 32; ++G) pn[G] = 5;
var Mr = Q(tn, 9, 0),
  Ur = Q(tn, 9, 1),
  Dr = Q(pn, 5, 0),
  Cr = Q(pn, 5, 1),
  On = function (r) {
    for (var n = r[0], t = 1; t < r.length; ++t) r[t] > n && (n = r[t]);
    return n;
  },
  V = function (r, n, t) {
    var e = n / 8 | 0;
    return (r[e] | r[e + 1] << 8) >> (n & 7) & t;
  },
  Ln = function (r, n) {
    var t = n / 8 | 0;
    return (r[t] | r[t + 1] << 8 | r[t + 2] << 16) >> (n & 7);
  },
  Tn = function (r) {
    return (r + 7) / 8 | 0;
  },
  X = function (r, n, t) {
    (n == null || n < 0) && (n = 0), (t == null || t > r.length) && (t = r.length);
    var e = new (r instanceof $ ? $ : r instanceof an ? an : D)(t - n);
    return e.set(r.subarray(n, t)), e;
  },
  et = {
    UnexpectedEOF: 0,
    InvalidBlockType: 1,
    InvalidLengthLiteral: 2,
    InvalidDistance: 3,
    StreamFinished: 4,
    NoStreamHandler: 5,
    InvalidHeader: 6,
    NoCallback: 7,
    InvalidUTF8: 8,
    ExtraFieldTooLong: 9,
    InvalidDate: 10,
    FilenameTooLong: 11,
    StreamFinishing: 12,
    InvalidZipData: 13,
    UnknownCompressionMethod: 14
  },
  Sr = ["unexpected EOF", "invalid block type", "invalid length/literal", "invalid distance", "stream finished", "no stream handler",, "no callback", "invalid UTF-8 data", "extra field too long", "date not in range 1980-2099", "filename too long", "stream finishing", "invalid zip data"],
  p = function (r, n, t) {
    var e = new Error(n || Sr[r]);
    if (e.code = r, Error.captureStackTrace && Error.captureStackTrace(e, p), !t) throw e;
    return e;
  },
  Fn = function (r, n, t) {
    var e = r.length;
    if (!e || t && t.f && !t.l) return n || new D(0);
    var i = !n || t,
      a = !t || t.i;
    t || (t = {}), n || (n = new D(e * 3));
    var o = function (Gn) {
        var Dn = n.length;
        if (Gn > Dn) {
          var vn = new D(Math.max(Dn * 2, Gn));
          vn.set(n), n = vn;
        }
      },
      s = t.f || 0,
      u = t.p || 0,
      f = t.b || 0,
      h = t.l,
      l = t.d,
      g = t.m,
      z = t.n,
      y = e * 8;
    do {
      if (!h) {
        s = V(r, u, 1);
        var m = V(r, u + 1, 3);
        if (u += 3, m) {
          if (m == 1) h = Ur, l = Cr, g = 9, z = 5;else if (m == 2) {
            var U = V(r, u, 31) + 257,
              w = V(r, u + 10, 15) + 4,
              I = U + V(r, u + 5, 31) + 1;
            u += 14;
            for (var S = new D(I), A = new D(19), c = 0; c < w; ++c) A[Cn[c]] = V(r, u + c * 3, 7);
            u += w * 3;
            for (var L = On(A), C = (1 << L) - 1, q = Q(A, L, 1), c = 0; c < I;) {
              var k = q[V(r, u, C)];
              u += k & 15;
              var v = k >>> 4;
              if (v < 16) S[c++] = v;else {
                var B = 0,
                  T = 0;
                for (v == 16 ? (T = 3 + V(r, u, 3), u += 2, B = S[c - 1]) : v == 17 ? (T = 3 + V(r, u, 7), u += 3) : v == 18 && (T = 11 + V(r, u, 127), u += 7); T--;) S[c++] = B;
              }
            }
            var O = S.subarray(0, U),
              Z = S.subarray(U);
            g = On(O), z = On(Z), h = Q(O, g, 1), l = Q(Z, z, 1);
          } else p(1);
        } else {
          var v = Tn(u) + 4,
            x = r[v - 4] | r[v - 3] << 8,
            M = v + x;
          if (M > e) {
            a && p(0);
            break;
          }
          i && o(f + x), n.set(r.subarray(v, M), f), t.b = f += x, t.p = u = M * 8, t.f = s;
          continue;
        }
        if (u > y) {
          a && p(0);
          break;
        }
      }
      i && o(f + 131072);
      for (var E = (1 << g) - 1, N = (1 << z) - 1, Y = u;; Y = u) {
        var B = h[Ln(r, u) & E],
          K = B >>> 4;
        if (u += B & 15, u > y) {
          a && p(0);
          break;
        }
        if (B || p(2), K < 256) n[f++] = K;else if (K == 256) {
          Y = u, h = null;
          break;
        } else {
          var R = K - 254;
          if (K > 264) {
            var c = K - 257,
              b = ln[c];
            R = V(r, u, (1 << b) - 1) + Qn[c], u += b;
          }
          var _ = l[Ln(r, u) & N],
            j = _ >>> 4;
          _ || p(3), u += _ & 15;
          var Z = Ar[j];
          if (j > 3) {
            var b = cn[j];
            Z += Ln(r, u) & (1 << b) - 1, u += b;
          }
          if (u > y) {
            a && p(0);
            break;
          }
          i && o(f + 131072);
          for (var H = f + R; f < H; f += 4) n[f] = n[f - Z], n[f + 1] = n[f + 1 - Z], n[f + 2] = n[f + 2 - Z], n[f + 3] = n[f + 3 - Z];
          f = H;
        }
      }
      t.l = h, t.p = Y, t.b = f, t.f = s, h && (s = 1, t.m = g, t.d = l, t.n = z);
    } while (!s);
    return f == n.length ? n : X(n, 0, f);
  },
  nn = function (r, n, t) {
    t <<= n & 7;
    var e = n / 8 | 0;
    r[e] |= t, r[e + 1] |= t >>> 8;
  },
  gn = function (r, n, t) {
    t <<= n & 7;
    var e = n / 8 | 0;
    r[e] |= t, r[e + 1] |= t >>> 8, r[e + 2] |= t >>> 16;
  },
  Pn = function (r, n) {
    for (var t = [], e = 0; e < r.length; ++e) r[e] && t.push({
      s: e,
      f: r[e]
    });
    var i = t.length,
      a = t.slice();
    if (!i) return [en, 0];
    if (i == 1) {
      var o = new D(t[0].s + 1);
      return o[t[0].s] = 1, [o, 1];
    }
    t.sort(function (I, S) {
      return I.f - S.f;
    }), t.push({
      s: -1,
      f: 25001
    });
    var s = t[0],
      u = t[1],
      f = 0,
      h = 1,
      l = 2;
    for (t[0] = {
      s: -1,
      f: s.f + u.f,
      l: s,
      r: u
    }; h != i - 1;) s = t[t[f].f < t[l].f ? f++ : l++], u = t[f != h && t[f].f < t[l].f ? f++ : l++], t[h++] = {
      s: -1,
      f: s.f + u.f,
      l: s,
      r: u
    };
    for (var g = a[0].s, e = 1; e < i; ++e) a[e].s > g && (g = a[e].s);
    var z = new $(g + 1),
      y = $n(t[h - 1], z, 0);
    if (y > n) {
      var e = 0,
        m = 0,
        v = y - n,
        x = 1 << v;
      for (a.sort(function (S, A) {
        return z[A.s] - z[S.s] || S.f - A.f;
      }); e < i; ++e) {
        var M = a[e].s;
        if (z[M] > n) m += x - (1 << y - z[M]), z[M] = n;else break;
      }
      for (m >>>= v; m > 0;) {
        var U = a[e].s;
        z[U] < n ? m -= 1 << n - z[U]++ - 1 : ++e;
      }
      for (; e >= 0 && m; --e) {
        var w = a[e].s;
        z[w] == n && (--z[w], ++m);
      }
      y = n;
    }
    return [new D(z), y];
  },
  $n = function (r, n, t) {
    return r.s == -1 ? Math.max($n(r.l, n, t + 1), $n(r.r, n, t + 1)) : n[r.s] = t;
  },
  Xn = function (r) {
    for (var n = r.length; n && !r[--n];);
    for (var t = new $(++n), e = 0, i = r[0], a = 1, o = function (u) {
        t[e++] = u;
      }, s = 1; s <= n; ++s) if (r[s] == i && s != n) ++a;else {
      if (!i && a > 2) {
        for (; a > 138; a -= 138) o(32754);
        a > 2 && (o(a > 10 ? a - 11 << 5 | 28690 : a - 3 << 5 | 12305), a = 0);
      } else if (a > 3) {
        for (o(i), --a; a > 6; a -= 6) o(8304);
        a > 2 && (o(a - 3 << 5 | 8208), a = 0);
      }
      for (; a--;) o(i);
      a = 1, i = r[s];
    }
    return [t.subarray(0, e), n];
  },
  yn = function (r, n) {
    for (var t = 0, e = 0; e < n.length; ++e) t += r[e] * n[e];
    return t;
  },
  In = function (r, n, t) {
    var e = t.length,
      i = Tn(n + 2);
    r[i] = e & 255, r[i + 1] = e >>> 8, r[i + 2] = r[i] ^ 255, r[i + 3] = r[i + 1] ^ 255;
    for (var a = 0; a < e; ++a) r[i + a + 4] = t[a];
    return (i + 4 + e) * 8;
  },
  dn = function (r, n, t, e, i, a, o, s, u, f, h) {
    nn(n, h++, t), ++i[256];
    for (var l = Pn(i, 15), g = l[0], z = l[1], y = Pn(a, 15), m = y[0], v = y[1], x = Xn(g), M = x[0], U = x[1], w = Xn(m), I = w[0], S = w[1], A = new $(19), c = 0; c < M.length; ++c) A[M[c] & 31]++;
    for (var c = 0; c < I.length; ++c) A[I[c] & 31]++;
    for (var L = Pn(A, 7), C = L[0], q = L[1], k = 19; k > 4 && !C[Cn[k - 1]]; --k);
    var B = f + 5 << 3,
      T = yn(i, tn) + yn(a, pn) + o,
      O = yn(i, g) + yn(a, m) + o + 14 + 3 * k + yn(A, C) + (2 * A[16] + 3 * A[17] + 7 * A[18]);
    if (B <= T && B <= O) return In(n, h, r.subarray(u, u + f));
    var Z, E, N, Y;
    if (nn(n, h, 1 + (O < T)), h += 2, O < T) {
      Z = Q(g, z, 0), E = g, N = Q(m, v, 0), Y = m;
      var K = Q(C, q, 0);
      nn(n, h, U - 257), nn(n, h + 5, S - 1), nn(n, h + 10, k - 4), h += 14;
      for (var c = 0; c < k; ++c) nn(n, h + 3 * c, C[Cn[c]]);
      h += 3 * k;
      for (var R = [M, I], b = 0; b < 2; ++b) for (var _ = R[b], c = 0; c < _.length; ++c) {
        var j = _[c] & 31;
        nn(n, h, K[j]), h += C[j], j > 15 && (nn(n, h, _[c] >>> 5 & 127), h += _[c] >>> 12);
      }
    } else Z = Mr, E = tn, N = Dr, Y = pn;
    for (var c = 0; c < s; ++c) if (e[c] > 255) {
      var j = e[c] >>> 18 & 31;
      gn(n, h, Z[j + 257]), h += E[j + 257], j > 7 && (nn(n, h, e[c] >>> 23 & 31), h += ln[j]);
      var H = e[c] & 31;
      gn(n, h, N[H]), h += Y[H], H > 3 && (gn(n, h, e[c] >>> 5 & 8191), h += cn[H]);
    } else gn(n, h, Z[e[c]]), h += E[e[c]];
    return gn(n, h, Z[256]), h + E[256];
  },
  Tr = new an([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]),
  en = new D(0),
  Fr = function (r, n, t, e, i, a) {
    var o = r.length,
      s = new D(e + o + 5 * (1 + Math.ceil(o / 7e3)) + i),
      u = s.subarray(e, s.length - i),
      f = 0;
    if (!n || o < 8) for (var h = 0; h <= o; h += 65535) {
      var l = h + 65535;
      l < o ? f = In(u, f, r.subarray(h, l)) : (u[h] = a, f = In(u, f, r.subarray(h, o)));
    } else {
      for (var g = Tr[n - 1], z = g >>> 13, y = g & 8191, m = (1 << t) - 1, v = new $(32768), x = new $(m + 1), M = Math.ceil(t / 3), U = 2 * M, w = function (Kn) {
          return (r[Kn] ^ r[Kn + 1] << M ^ r[Kn + 2] << U) & m;
        }, I = new an(25e3), S = new $(288), A = new $(32), c = 0, L = 0, h = 0, C = 0, q = 0, k = 0; h < o; ++h) {
        var B = w(h),
          T = h & 32767,
          O = x[B];
        if (v[T] = O, x[B] = T, q <= h) {
          var Z = o - h;
          if ((c > 7e3 || C > 24576) && Z > 423) {
            f = dn(r, u, 0, I, S, A, L, C, k, h - k, f), C = c = L = 0, k = h;
            for (var E = 0; E < 286; ++E) S[E] = 0;
            for (var E = 0; E < 30; ++E) A[E] = 0;
          }
          var N = 2,
            Y = 0,
            K = y,
            R = T - O & 32767;
          if (Z > 2 && B == w(h - R)) for (var b = Math.min(z, Z) - 1, _ = Math.min(32767, h), j = Math.min(258, Z); R <= _ && --K && T != O;) {
            if (r[h + N] == r[h + N - R]) {
              for (var H = 0; H < j && r[h + H] == r[h + H - R]; ++H);
              if (H > N) {
                if (N = H, Y = R, H > b) break;
                for (var Gn = Math.min(R, H - 2), Dn = 0, E = 0; E < Gn; ++E) {
                  var vn = h - R + E + 32768 & 32767,
                    rt = v[vn],
                    pr = vn - rt + 32768 & 32767;
                  pr > Dn && (Dn = pr, O = vn);
                }
              }
            }
            T = O, O = v[T], R += T - O + 32768 & 32767;
          }
          if (Y) {
            I[C++] = 268435456 | kn[N] << 18 | Vn[Y];
            var gr = kn[N] & 31,
              yr = Vn[Y] & 31;
            L += ln[gr] + cn[yr], ++S[257 + gr], ++A[yr], q = h + N, ++c;
          } else I[C++] = r[h], ++S[r[h]];
        }
      }
      f = dn(r, u, a, I, S, A, L, C, k, h - k, f), !a && f & 7 && (f = In(u, f + 1, en));
    }
    return X(s, 0, e + Tn(f) + i);
  },
  Ir = function () {
    for (var r = new Int32Array(256), n = 0; n < 256; ++n) {
      for (var t = n, e = 9; --e;) t = (t & 1 && -306674912) ^ t >>> 1;
      r[n] = t;
    }
    return r;
  }(),
  wn = function () {
    var r = -1;
    return {
      p: function (n) {
        for (var t = r, e = 0; e < n.length; ++e) t = Ir[t & 255 ^ n[e]] ^ t >>> 8;
        r = t;
      },
      d: function () {
        return ~r;
      }
    };
  },
  bn = function () {
    var r = 1,
      n = 0;
    return {
      p: function (t) {
        for (var e = r, i = n, a = t.length | 0, o = 0; o != a;) {
          for (var s = Math.min(o + 2655, a); o < s; ++o) i += e += t[o];
          e = (e & 65535) + 15 * (e >> 16), i = (i & 65535) + 15 * (i >> 16);
        }
        r = e, n = i;
      },
      d: function () {
        return r %= 65521, n %= 65521, (r & 255) << 24 | r >>> 8 << 16 | (n & 255) << 8 | n >>> 8;
      }
    };
  },
  hn = function (r, n, t, e, i) {
    return Fr(r, n.level == null ? 6 : n.level, n.mem == null ? Math.ceil(Math.max(8, Math.min(13, Math.log(r.length))) * 1.5) : 12 + n.mem, t, e, !i);
  },
  Zn = function (r, n) {
    var t = {};
    for (var e in r) t[e] = r[e];
    for (var e in n) t[e] = n[e];
    return t;
  },
  Zr = function (r, n, t) {
    for (var e = r(), i = r.toString(), a = i.slice(i.indexOf("[") + 1, i.lastIndexOf("]")).replace(/ /g, "").split(","), o = 0; o < e.length; ++o) {
      var s = e[o],
        u = a[o];
      if (typeof s == "function") {
        n += ";" + u + "=";
        var f = s.toString();
        if (s.prototype) {
          if (f.indexOf("[native code]") != -1) {
            var h = f.indexOf(" ", 8) + 1;
            n += f.slice(h, f.indexOf("(", h));
          } else {
            n += f;
            for (var l in s.prototype) n += ";" + u + ".prototype." + l + "=" + s.prototype[l].toString();
          }
        } else n += f;
      } else t[u] = s;
    }
    return [n, t];
  },
  qn = [],
  it = function (r) {
    var n = [];
    for (var t in r) (r[t] instanceof D || r[t] instanceof $ || r[t] instanceof an) && n.push((r[t] = new r[t].constructor(r[t])).buffer);
    return n;
  },
  Br = function (r, n, t, e) {
    var i;
    if (!qn[t]) {
      for (var a = "", o = {}, s = r.length - 1, u = 0; u < s; ++u) i = Zr(r[u], a, o), a = i[0], o = i[1];
      qn[t] = Zr(r[s], a, o);
    }
    var f = Zn({}, qn[t][1]);
    return tt(qn[t][0] + ";onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=" + n.toString() + "}", t, f, it(f), e);
  },
  mn = function () {
    return [D, $, an, ln, cn, Cn, Qn, Ar, Ur, Cr, Sn, Sr, Q, On, V, Ln, Tn, X, p, Fn, Mn, fn, _n];
  },
  zn = function () {
    return [D, $, an, ln, cn, Cn, kn, Vn, Mr, tn, Dr, pn, Sn, Tr, en, Q, nn, gn, Pn, $n, Xn, yn, In, dn, Tn, X, Fr, hn, Bn, fn];
  },
  Er = function () {
    return [rr, er, F, wn, Ir];
  },
  Gr = function () {
    return [tr, Lr];
  },
  kr = function () {
    return [ir, F, bn];
  },
  Or = function () {
    return [Pr];
  },
  fn = function (r) {
    return postMessage(r, [r.buffer]);
  },
  _n = function (r) {
    return r && r.size && new D(r.size);
  },
  xn = function (r, n, t, e, i, a) {
    var o = Br(t, e, i, function (s, u) {
      o.terminate(), a(s, u);
    });
    return o.postMessage([r, n], n.consume ? [r.buffer] : []), function () {
      o.terminate();
    };
  },
  d = function (r) {
    return r.ondata = function (n, t) {
      return postMessage([n, t], [n.buffer]);
    }, function (n) {
      return r.push(n.data[0], n.data[1]);
    };
  },
  An = function (r, n, t, e, i) {
    var a,
      o = Br(r, e, i, function (s, u) {
        s ? (o.terminate(), n.ondata.call(n, s)) : (u[1] && o.terminate(), n.ondata.call(n, s, u[0], u[1]));
      });
    o.postMessage(t), n.push = function (s, u) {
      n.ondata || p(5), a && n.ondata(p(4, 0, 1), null, !!u), o.postMessage([s, a = u], [s.buffer]);
    }, n.terminate = function () {
      o.terminate();
    };
  },
  W = function (r, n) {
    return r[n] | r[n + 1] << 8;
  },
  P = function (r, n) {
    return (r[n] | r[n + 1] << 8 | r[n + 2] << 16 | r[n + 3] << 24) >>> 0;
  },
  nr = function (r, n) {
    return P(r, n) + P(r, n + 4) * 4294967296;
  },
  F = function (r, n, t) {
    for (; t; ++n) r[n] = t, t >>>= 8;
  },
  rr = function (r, n) {
    var t = n.filename;
    if (r[0] = 31, r[1] = 139, r[2] = 8, r[8] = n.level < 2 ? 4 : n.level == 9 ? 2 : 0, r[9] = 3, n.mtime != 0 && F(r, 4, Math.floor(new Date(n.mtime || Date.now()) / 1e3)), t) {
      r[3] = 8;
      for (var e = 0; e <= t.length; ++e) r[e + 10] = t.charCodeAt(e);
    }
  },
  tr = function (r) {
    (r[0] != 31 || r[1] != 139 || r[2] != 8) && p(6, "invalid gzip data");
    var n = r[3],
      t = 10;
    n & 4 && (t += r[10] | (r[11] << 8) + 2);
    for (var e = (n >> 3 & 1) + (n >> 4 & 1); e > 0; e -= !r[t++]);
    return t + (n & 2);
  },
  Lr = function (r) {
    var n = r.length;
    return (r[n - 4] | r[n - 3] << 8 | r[n - 2] << 16 | r[n - 1] << 24) >>> 0;
  },
  er = function (r) {
    return 10 + (r.filename && r.filename.length + 1 || 0);
  },
  ir = function (r, n) {
    var t = n.level,
      e = t == 0 ? 0 : t < 6 ? 1 : t == 9 ? 3 : 2;
    r[0] = 120, r[1] = e << 6 | (e ? 32 - 2 * e : 1);
  },
  Pr = function (r) {
    ((r[0] & 15) != 8 || r[0] >>> 4 > 7 || (r[0] << 8 | r[1]) % 31) && p(6, "invalid zlib data"), r[1] & 32 && p(6, "invalid zlib data: preset dictionaries not supported");
  };
exports.FlateErrorCode = et;
function ar(r, n) {
  return !n && typeof r == "function" && (n = r, r = {}), this.ondata = n, r;
}
var rn = function () {
    function r(n, t) {
      !t && typeof n == "function" && (t = n, n = {}), this.ondata = t, this.o = n || {};
    }
    return r.prototype.p = function (n, t) {
      this.ondata(hn(n, this.o, 0, 0, !t), t);
    }, r.prototype.push = function (n, t) {
      this.ondata || p(5), this.d && p(4), this.d = t, this.p(n, t || !1);
    }, r;
  }(),
  $r = function () {
    function r(n, t) {
      An([zn, function () {
        return [d, rn];
      }], this, ar.call(this, n, t), function (e) {
        var i = new rn(e.data);
        onmessage = d(i);
      }, 6);
    }
    return r;
  }();
exports.AsyncDeflate = $r;
exports.Deflate = rn;
function qr(r, n, t) {
  return t || (t = n, n = {}), typeof t != "function" && p(7), xn(r, n, [zn], function (e) {
    return fn(Bn(e.data[0], e.data[1]));
  }, 0, t);
}
function Bn(r, n) {
  return hn(r, n || {}, 0, 0);
}
var J = function () {
    function r(n) {
      this.s = {}, this.p = new D(0), this.ondata = n;
    }
    return r.prototype.e = function (n) {
      this.ondata || p(5), this.d && p(4);
      var t = this.p.length,
        e = new D(t + n.length);
      e.set(this.p), e.set(n, t), this.p = e;
    }, r.prototype.c = function (n) {
      this.d = this.s.i = n || !1;
      var t = this.s.b,
        e = Fn(this.p, this.o, this.s);
      this.ondata(X(e, t, this.s.b), this.d), this.o = X(e, this.s.b - 32768), this.s.b = this.o.length, this.p = X(this.p, this.s.p / 8 | 0), this.s.p &= 7;
    }, r.prototype.push = function (n, t) {
      this.e(n), this.c(t);
    }, r;
  }(),
  or = function () {
    function r(n) {
      this.ondata = n, An([mn, function () {
        return [d, J];
      }], this, 0, function () {
        var t = new J();
        onmessage = d(t);
      }, 7);
    }
    return r;
  }();
exports.AsyncInflate = or;
exports.Inflate = J;
function fr(r, n, t) {
  return t || (t = n, n = {}), typeof t != "function" && p(7), xn(r, n, [mn], function (e) {
    return fn(Mn(e.data[0], _n(e.data[1])));
  }, 1, t);
}
function Mn(r, n) {
  return Fn(r, n);
}
var Hn = function () {
    function r(n, t) {
      this.c = wn(), this.l = 0, this.v = 1, rn.call(this, n, t);
    }
    return r.prototype.push = function (n, t) {
      rn.prototype.push.call(this, n, t);
    }, r.prototype.p = function (n, t) {
      this.c.p(n), this.l += n.length;
      var e = hn(n, this.o, this.v && er(this.o), t && 8, !t);
      this.v && (rr(e, this.o), this.v = 0), t && (F(e, e.length - 8, this.c.d()), F(e, e.length - 4, this.l)), this.ondata(e, t);
    }, r;
  }(),
  Hr = function () {
    function r(n, t) {
      An([zn, Er, function () {
        return [d, rn, Hn];
      }], this, ar.call(this, n, t), function (e) {
        var i = new Hn(e.data);
        onmessage = d(i);
      }, 8);
    }
    return r;
  }();
exports.AsyncGzip = exports.AsyncCompress = Hr;
exports.Gzip = exports.Compress = Hn;
function Nr(r, n, t) {
  return t || (t = n, n = {}), typeof t != "function" && p(7), xn(r, n, [zn, Er, function () {
    return [Nn];
  }], function (e) {
    return fn(Nn(e.data[0], e.data[1]));
  }, 2, t);
}
function Nn(r, n) {
  n || (n = {});
  var t = wn(),
    e = r.length;
  t.p(r);
  var i = hn(r, n, er(n), 8),
    a = i.length;
  return rr(i, n), F(i, a - 8, t.d()), F(i, a - 4, e), i;
}
var Rn = function () {
    function r(n) {
      this.v = 1, J.call(this, n);
    }
    return r.prototype.push = function (n, t) {
      if (J.prototype.e.call(this, n), this.v) {
        var e = this.p.length > 3 ? tr(this.p) : 4;
        if (e >= this.p.length && !t) return;
        this.p = this.p.subarray(e), this.v = 0;
      }
      t && (this.p.length < 8 && p(6, "invalid gzip data"), this.p = this.p.subarray(0, -8)), J.prototype.c.call(this, t);
    }, r;
  }(),
  Rr = function () {
    function r(n) {
      this.ondata = n, An([mn, Gr, function () {
        return [d, J, Rn];
      }], this, 0, function () {
        var t = new Rn();
        onmessage = d(t);
      }, 9);
    }
    return r;
  }();
exports.AsyncGunzip = Rr;
exports.Gunzip = Rn;
function Wr(r, n, t) {
  return t || (t = n, n = {}), typeof t != "function" && p(7), xn(r, n, [mn, Gr, function () {
    return [Wn];
  }], function (e) {
    return fn(Wn(e.data[0]));
  }, 3, t);
}
function Wn(r, n) {
  return Fn(r.subarray(tr(r), -8), n || new D(Lr(r)));
}
var sr = function () {
    function r(n, t) {
      this.c = bn(), this.v = 1, rn.call(this, n, t);
    }
    return r.prototype.push = function (n, t) {
      rn.prototype.push.call(this, n, t);
    }, r.prototype.p = function (n, t) {
      this.c.p(n);
      var e = hn(n, this.o, this.v && 2, t && 4, !t);
      this.v && (ir(e, this.o), this.v = 0), t && F(e, e.length - 4, this.c.d()), this.ondata(e, t);
    }, r;
  }(),
  at = function () {
    function r(n, t) {
      An([zn, kr, function () {
        return [d, rn, sr];
      }], this, ar.call(this, n, t), function (e) {
        var i = new sr(e.data);
        onmessage = d(i);
      }, 10);
    }
    return r;
  }();
exports.AsyncZlib = at;
exports.Zlib = sr;
function ot(r, n, t) {
  return t || (t = n, n = {}), typeof t != "function" && p(7), xn(r, n, [zn, kr, function () {
    return [ur];
  }], function (e) {
    return fn(ur(e.data[0], e.data[1]));
  }, 4, t);
}
function ur(r, n) {
  n || (n = {});
  var t = bn();
  t.p(r);
  var e = hn(r, n, 2, 4);
  return ir(e, n), F(e, e.length - 4, t.d()), e;
}
var Yn = function () {
    function r(n) {
      this.v = 1, J.call(this, n);
    }
    return r.prototype.push = function (n, t) {
      if (J.prototype.e.call(this, n), this.v) {
        if (this.p.length < 2 && !t) return;
        this.p = this.p.subarray(2), this.v = 0;
      }
      t && (this.p.length < 4 && p(6, "invalid zlib data"), this.p = this.p.subarray(0, -4)), J.prototype.c.call(this, t);
    }, r;
  }(),
  Yr = function () {
    function r(n) {
      this.ondata = n, An([mn, Or, function () {
        return [d, J, Yn];
      }], this, 0, function () {
        var t = new Yn();
        onmessage = d(t);
      }, 11);
    }
    return r;
  }();
exports.AsyncUnzlib = Yr;
exports.Unzlib = Yn;
function jr(r, n, t) {
  return t || (t = n, n = {}), typeof t != "function" && p(7), xn(r, n, [mn, Or, function () {
    return [jn];
  }], function (e) {
    return fn(jn(e.data[0], _n(e.data[1])));
  }, 5, t);
}
function jn(r, n) {
  return Fn((Pr(r), r.subarray(2, -4)), n);
}
var Jr = function () {
    function r(n) {
      this.G = Rn, this.I = J, this.Z = Yn, this.ondata = n;
    }
    return r.prototype.push = function (n, t) {
      if (this.ondata || p(5), this.s) this.s.push(n, t);else {
        if (this.p && this.p.length) {
          var e = new D(this.p.length + n.length);
          e.set(this.p), e.set(n, this.p.length);
        } else this.p = n;
        if (this.p.length > 2) {
          var i = this,
            a = function () {
              i.ondata.apply(i, arguments);
            };
          this.s = this.p[0] == 31 && this.p[1] == 139 && this.p[2] == 8 ? new this.G(a) : (this.p[0] & 15) != 8 || this.p[0] >> 4 > 7 || (this.p[0] << 8 | this.p[1]) % 31 ? new this.I(a) : new this.Z(a), this.s.push(this.p, t), this.p = null;
        }
      }
    }, r;
  }(),
  ft = function () {
    function r(n) {
      this.G = Rr, this.I = or, this.Z = Yr, this.ondata = n;
    }
    return r.prototype.push = function (n, t) {
      Jr.prototype.push.call(this, n, t);
    }, r;
  }();
exports.AsyncDecompress = ft;
exports.Decompress = Jr;
function st(r, n, t) {
  return t || (t = n, n = {}), typeof t != "function" && p(7), r[0] == 31 && r[1] == 139 && r[2] == 8 ? Wr(r, n, t) : (r[0] & 15) != 8 || r[0] >> 4 > 7 || (r[0] << 8 | r[1]) % 31 ? fr(r, n, t) : jr(r, n, t);
}
function ut(r, n) {
  return r[0] == 31 && r[1] == 139 && r[2] == 8 ? Wn(r, n) : (r[0] & 15) != 8 || r[0] >> 4 > 7 || (r[0] << 8 | r[1]) % 31 ? Mn(r, n) : jn(r, n);
}
var hr = function (r, n, t, e) {
    for (var i in r) {
      var a = r[i],
        o = n + i;
      a instanceof D ? t[o] = [a, e] : Array.isArray(a) ? t[o] = [a[0], Zn(e, a[1])] : hr(a, o + "/", t, e);
    }
  },
  Kr = typeof TextEncoder != "undefined" && new TextEncoder(),
  vr = typeof TextDecoder != "undefined" && new TextDecoder(),
  Qr = 0;
try {
  vr.decode(en, {
    stream: !0
  }), Qr = 1;
} catch (r) {}
var Vr = function (r) {
    for (var n = "", t = 0;;) {
      var e = r[t++],
        i = (e > 127) + (e > 223) + (e > 239);
      if (t + i > r.length) return [n, X(r, t - 1)];
      i ? i == 3 ? (e = ((e & 15) << 18 | (r[t++] & 63) << 12 | (r[t++] & 63) << 6 | r[t++] & 63) - 65536, n += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : i & 1 ? n += String.fromCharCode((e & 31) << 6 | r[t++] & 63) : n += String.fromCharCode((e & 15) << 12 | (r[t++] & 63) << 6 | r[t++] & 63) : n += String.fromCharCode(e);
    }
  },
  ht = function () {
    function r(n) {
      this.ondata = n, Qr ? this.t = new TextDecoder() : this.p = en;
    }
    return r.prototype.push = function (n, t) {
      if (this.ondata || p(5), t = !!t, this.t) {
        this.ondata(this.t.decode(n, {
          stream: !0
        }), t), t && (this.t.decode().length && p(8), this.t = null);
        return;
      }
      this.p || p(4);
      var e = new D(this.p.length + n.length);
      e.set(this.p), e.set(n, this.p.length);
      var i = Vr(e),
        a = i[0],
        o = i[1];
      t ? (o.length && p(8), this.p = null) : this.p = o, this.ondata(a, t);
    }, r;
  }(),
  vt = function () {
    function r(n) {
      this.ondata = n;
    }
    return r.prototype.push = function (n, t) {
      this.ondata || p(5), this.d && p(4), this.ondata(sn(n), this.d = t || !1);
    }, r;
  }();
exports.EncodeUTF8 = vt;
exports.DecodeUTF8 = ht;
function sn(r, n) {
  if (n) {
    for (var t = new D(r.length), e = 0; e < r.length; ++e) t[e] = r.charCodeAt(e);
    return t;
  }
  if (Kr) return Kr.encode(r);
  for (var i = r.length, a = new D(r.length + (r.length >> 1)), o = 0, s = function (h) {
      a[o++] = h;
    }, e = 0; e < i; ++e) {
    if (o + 5 > a.length) {
      var u = new D(o + 8 + (i - e << 1));
      u.set(a), a = u;
    }
    var f = r.charCodeAt(e);
    f < 128 || n ? s(f) : f < 2048 ? (s(192 | f >> 6), s(128 | f & 63)) : f > 55295 && f < 57344 ? (f = 65536 + (f & 1023 << 10) | r.charCodeAt(++e) & 1023, s(240 | f >> 18), s(128 | f >> 12 & 63), s(128 | f >> 6 & 63), s(128 | f & 63)) : (s(224 | f >> 12), s(128 | f >> 6 & 63), s(128 | f & 63));
  }
  return X(a, 0, o);
}
function lr(r, n) {
  if (n) {
    for (var t = "", e = 0; e < r.length; e += 16384) t += String.fromCharCode.apply(null, r.subarray(e, e + 16384));
    return t;
  } else {
    if (vr) return vr.decode(r);
    var i = Vr(r),
      a = i[0],
      o = i[1];
    return o.length && p(8), a;
  }
}
var Xr = function (r) {
    return r == 1 ? 3 : r < 6 ? 2 : r == 9 ? 1 : 0;
  },
  dr = function (r, n) {
    return n + 30 + W(r, n + 26) + W(r, n + 28);
  },
  br = function (r, n, t) {
    var e = W(r, n + 28),
      i = lr(r.subarray(n + 46, n + 46 + e), !(W(r, n + 8) & 2048)),
      a = n + 46 + e,
      o = P(r, n + 20),
      s = t && o == 4294967295 ? _r(r, a) : [o, P(r, n + 24), P(r, n + 42)],
      u = s[0],
      f = s[1],
      h = s[2];
    return [W(r, n + 10), u, f, i, a + W(r, n + 30) + W(r, n + 32), h];
  },
  _r = function (r, n) {
    for (; W(r, n) != 1; n += 4 + W(r, n + 2));
    return [nr(r, n + 12), nr(r, n + 4), nr(r, n + 20)];
  },
  un = function (r) {
    var n = 0;
    if (r) for (var t in r) {
      var e = r[t].length;
      e > 65535 && p(9), n += e + 4;
    }
    return n;
  },
  Un = function (r, n, t, e, i, a, o, s) {
    var u = e.length,
      f = t.extra,
      h = s && s.length,
      l = un(f);
    F(r, n, o != null ? 33639248 : 67324752), n += 4, o != null && (r[n++] = 20, r[n++] = t.os), r[n] = 20, n += 2, r[n++] = t.flag << 1 | (a == null && 8), r[n++] = i && 8, r[n++] = t.compression & 255, r[n++] = t.compression >> 8;
    var g = new Date(t.mtime == null ? Date.now() : t.mtime),
      z = g.getFullYear() - 1980;
    if ((z < 0 || z > 119) && p(10), F(r, n, z << 25 | g.getMonth() + 1 << 21 | g.getDate() << 16 | g.getHours() << 11 | g.getMinutes() << 5 | g.getSeconds() >>> 1), n += 4, a != null && (F(r, n, t.crc), F(r, n + 4, a), F(r, n + 8, t.size)), F(r, n + 12, u), F(r, n + 14, l), n += 16, o != null && (F(r, n, h), F(r, n + 6, t.attrs), F(r, n + 10, o), n += 14), r.set(e, n), n += u, l) for (var y in f) {
      var m = f[y],
        v = m.length;
      F(r, n, +y), F(r, n + 2, v), r.set(m, n + 4), n += 4 + v;
    }
    return h && (r.set(s, n), n += h), n;
  },
  cr = function (r, n, t, e, i) {
    F(r, n, 101010256), F(r, n + 8, t), F(r, n + 10, t), F(r, n + 12, e), F(r, n + 16, i);
  },
  En = function () {
    function r(n) {
      this.filename = n, this.c = wn(), this.size = 0, this.compression = 0;
    }
    return r.prototype.process = function (n, t) {
      this.ondata(null, n, t);
    }, r.prototype.push = function (n, t) {
      this.ondata || p(5), this.c.p(n), this.size += n.length, t && (this.crc = this.c.d()), this.process(n, t || !1);
    }, r;
  }(),
  lt = function () {
    function r(n, t) {
      var e = this;
      t || (t = {}), En.call(this, n), this.d = new rn(t, function (i, a) {
        e.ondata(null, i, a);
      }), this.compression = 8, this.flag = Xr(t.level);
    }
    return r.prototype.process = function (n, t) {
      try {
        this.d.push(n, t);
      } catch (e) {
        this.ondata(e, null, t);
      }
    }, r.prototype.push = function (n, t) {
      En.prototype.push.call(this, n, t);
    }, r;
  }(),
  ct = function () {
    function r(n, t) {
      var e = this;
      t || (t = {}), En.call(this, n), this.d = new $r(t, function (i, a, o) {
        e.ondata(i, a, o);
      }), this.compression = 8, this.flag = Xr(t.level), this.terminate = this.d.terminate;
    }
    return r.prototype.process = function (n, t) {
      this.d.push(n, t);
    }, r.prototype.push = function (n, t) {
      En.prototype.push.call(this, n, t);
    }, r;
  }(),
  pt = function () {
    function r(n) {
      this.ondata = n, this.u = [], this.d = 1;
    }
    return r.prototype.add = function (n) {
      var t = this;
      if (this.ondata || p(5), this.d & 2) this.ondata(p(4 + (this.d & 1) * 8, 0, 1), null, !1);else {
        var e = sn(n.filename),
          i = e.length,
          a = n.comment,
          o = a && sn(a),
          s = i != n.filename.length || o && a.length != o.length,
          u = i + un(n.extra) + 30;
        i > 65535 && this.ondata(p(11, 0, 1), null, !1);
        var f = new D(u);
        Un(f, 0, n, e, s);
        var h = [f],
          l = function () {
            for (var v = 0, x = h; v < x.length; v++) {
              var M = x[v];
              t.ondata(null, M, !1);
            }
            h = [];
          },
          g = this.d;
        this.d = 0;
        var z = this.u.length,
          y = Zn(n, {
            f: e,
            u: s,
            o,
            t: function () {
              n.terminate && n.terminate();
            },
            r: function () {
              if (l(), g) {
                var v = t.u[z + 1];
                v ? v.r() : t.d = 1;
              }
              g = 1;
            }
          }),
          m = 0;
        n.ondata = function (v, x, M) {
          if (v) t.ondata(v, x, M), t.terminate();else if (m += x.length, h.push(x), M) {
            var U = new D(16);
            F(U, 0, 134695760), F(U, 4, n.crc), F(U, 8, m), F(U, 12, n.size), h.push(U), y.c = m, y.b = u + m + 16, y.crc = n.crc, y.size = n.size, g && y.r(), g = 1;
          } else g && l();
        }, this.u.push(y);
      }
    }, r.prototype.end = function () {
      var n = this;
      if (this.d & 2) {
        this.ondata(p(4 + (this.d & 1) * 8, 0, 1), null, !0);
        return;
      }
      this.d ? this.e() : this.u.push({
        r: function () {
          if (!(n.d & 1)) return;
          n.u.splice(-1, 1), n.e();
        },
        t: function () {}
      }), this.d = 3;
    }, r.prototype.e = function () {
      for (var n = 0, t = 0, e = 0, i = 0, a = this.u; i < a.length; i++) {
        var o = a[i];
        e += 46 + o.f.length + un(o.extra) + (o.o ? o.o.length : 0);
      }
      for (var s = new D(e + 22), u = 0, f = this.u; u < f.length; u++) {
        var o = f[u];
        Un(s, n, o, o.f, o.u, o.c, t, o.o), n += 46 + o.f.length + un(o.extra) + (o.o ? o.o.length : 0), t += o.b;
      }
      cr(s, n, this.u.length, e, t), this.ondata(null, s, !0), this.d = 2;
    }, r.prototype.terminate = function () {
      for (var n = 0, t = this.u; n < t.length; n++) {
        var e = t[n];
        e.t();
      }
      this.d = 2;
    }, r;
  }();
exports.Zip = pt;
exports.AsyncZipDeflate = ct;
exports.ZipDeflate = lt;
exports.ZipPassThrough = En;
function gt(r, n, t) {
  t || (t = n, n = {}), typeof t != "function" && p(7);
  var e = {};
  hr(r, "", e, n);
  var i = Object.keys(e),
    a = i.length,
    o = 0,
    s = 0,
    u = a,
    f = new Array(a),
    h = [],
    l = function () {
      for (var v = 0; v < h.length; ++v) h[v]();
    },
    g = function (v, x) {
      Jn(function () {
        t(v, x);
      });
    };
  Jn(function () {
    g = t;
  });
  var z = function () {
    var v = new D(s + 22),
      x = o,
      M = s - o;
    s = 0;
    for (var U = 0; U < u; ++U) {
      var w = f[U];
      try {
        var I = w.c.length;
        Un(v, s, w, w.f, w.u, I);
        var S = 30 + w.f.length + un(w.extra),
          A = s + S;
        v.set(w.c, A), Un(v, o, w, w.f, w.u, I, s, w.m), o += 16 + S + (w.m ? w.m.length : 0), s = A + I;
      } catch (c) {
        return g(c, null);
      }
    }
    cr(v, o, f.length, M, x), g(null, v);
  };
  a || z();
  for (var y = function (v) {
      var x = i[v],
        M = e[x],
        U = M[0],
        w = M[1],
        I = wn(),
        S = U.length;
      I.p(U);
      var A = sn(x),
        c = A.length,
        L = w.comment,
        C = L && sn(L),
        q = C && C.length,
        k = un(w.extra),
        B = w.level == 0 ? 0 : 8,
        T = function (O, Z) {
          if (O) l(), g(O, null);else {
            var E = Z.length;
            f[v] = Zn(w, {
              size: S,
              crc: I.d(),
              c: Z,
              f: A,
              m: C,
              u: c != x.length || C && L.length != q,
              compression: B
            }), o += 30 + c + k + E, s += 76 + 2 * (c + k) + (q || 0) + E, --a || z();
          }
        };
      if (c > 65535 && T(p(11, 0, 1), null), !B) T(null, U);else if (S < 16e4) try {
        T(null, Bn(U, w));
      } catch (O) {
        T(O, null);
      } else h.push(qr(U, w, T));
    }, m = 0; m < u; ++m) y(m);
  return l;
}
function yt(r, n) {
  n || (n = {});
  var t = {},
    e = [];
  hr(r, "", t, n);
  var i = 0,
    a = 0;
  for (var o in t) {
    var s = t[o],
      u = s[0],
      f = s[1],
      h = f.level == 0 ? 0 : 8,
      l = sn(o),
      g = l.length,
      z = f.comment,
      y = z && sn(z),
      m = y && y.length,
      v = un(f.extra);
    g > 65535 && p(11);
    var x = h ? Bn(u, f) : u,
      M = x.length,
      U = wn();
    U.p(u), e.push(Zn(f, {
      size: u.length,
      crc: U.d(),
      c: x,
      f: l,
      m: y,
      u: g != o.length || y && z.length != m,
      o: i,
      compression: h
    })), i += 30 + g + v + M, a += 76 + 2 * (g + v) + (m || 0) + M;
  }
  for (var w = new D(a + 22), I = i, S = a - i, A = 0; A < e.length; ++A) {
    var l = e[A];
    Un(w, l.o, l, l.f, l.u, l.c.length);
    var c = 30 + l.f.length + un(l.extra);
    w.set(l.c, l.o + c), Un(w, i, l, l.f, l.u, l.c.length, l.o, l.m), i += 16 + c + (l.m ? l.m.length : 0);
  }
  return cr(w, i, e.length, S, I), w;
}
var nt = function () {
    function r() {}
    return r.prototype.push = function (n, t) {
      this.ondata(null, n, t);
    }, r.compression = 0, r;
  }(),
  wt = function () {
    function r() {
      var n = this;
      this.i = new J(function (t, e) {
        n.ondata(null, t, e);
      });
    }
    return r.prototype.push = function (n, t) {
      try {
        this.i.push(n, t);
      } catch (e) {
        this.ondata(e, null, t);
      }
    }, r.compression = 8, r;
  }(),
  mt = function () {
    function r(n, t) {
      var e = this;
      t < 32e4 ? this.i = new J(function (i, a) {
        e.ondata(null, i, a);
      }) : (this.i = new or(function (i, a, o) {
        e.ondata(i, a, o);
      }), this.terminate = this.i.terminate);
    }
    return r.prototype.push = function (n, t) {
      this.i.terminate && (n = X(n, 0)), this.i.push(n, t);
    }, r.compression = 8, r;
  }(),
  zt = function () {
    function r(n) {
      this.onfile = n, this.k = [], this.o = {
        0: nt
      }, this.p = en;
    }
    return r.prototype.push = function (n, t) {
      var e = this;
      if (this.onfile || p(5), this.p || p(4), this.c > 0) {
        var i = Math.min(this.c, n.length),
          a = n.subarray(0, i);
        if (this.c -= i, this.d ? this.d.push(a, !this.c) : this.k[0].push(a), n = n.subarray(i), n.length) return this.push(n, t);
      } else {
        var o = 0,
          s = 0,
          u = void 0,
          f = void 0;
        this.p.length ? n.length ? (f = new D(this.p.length + n.length), f.set(this.p), f.set(n, this.p.length)) : f = this.p : f = n;
        for (var h = f.length, l = this.c, g = l && this.d, z = function () {
            var x,
              M = P(f, s);
            if (M == 67324752) {
              o = 1, u = s, y.d = null, y.c = 0;
              var U = W(f, s + 6),
                w = W(f, s + 8),
                I = U & 2048,
                S = U & 8,
                A = W(f, s + 26),
                c = W(f, s + 28);
              if (h > s + 30 + A + c) {
                var L = [];
                y.k.unshift(L), o = 2;
                var C = P(f, s + 18),
                  q = P(f, s + 22),
                  k = lr(f.subarray(s + 30, s += 30 + A), !I);
                C == 4294967295 ? (x = S ? [-2] : _r(f, s), C = x[0], q = x[1]) : S && (C = -1), s += c, y.c = C;
                var B,
                  T = {
                    name: k,
                    compression: w,
                    start: function () {
                      if (T.ondata || p(5), !C) T.ondata(null, en, !0);else {
                        var O = e.o[w];
                        O || T.ondata(p(14, "unknown compression type " + w, 1), null, !1), B = C < 0 ? new O(k) : new O(k, C, q), B.ondata = function (Y, K, R) {
                          T.ondata(Y, K, R);
                        };
                        for (var Z = 0, E = L; Z < E.length; Z++) {
                          var N = E[Z];
                          B.push(N, !1);
                        }
                        e.k[0] == L && e.c ? e.d = B : B.push(en, !0);
                      }
                    },
                    terminate: function () {
                      B && B.terminate && B.terminate();
                    }
                  };
                C >= 0 && (T.size = C, T.originalSize = q), y.onfile(T);
              }
              return "break";
            } else if (l) {
              if (M == 134695760) return u = s += 12 + (l == -2 && 8), o = 3, y.c = 0, "break";
              if (M == 33639248) return u = s -= 4, o = 3, y.c = 0, "break";
            }
          }, y = this; s < h - 4; ++s) {
          var m = z();
          if (m === "break") break;
        }
        if (this.p = en, l < 0) {
          var v = o ? f.subarray(0, u - 12 - (l == -2 && 8) - (P(f, u - 16) == 134695760 && 4)) : f.subarray(0, s);
          g ? g.push(v, !!o) : this.k[+(o == 2)].push(v);
        }
        if (o & 2) return this.push(f.subarray(s), t);
        this.p = f.subarray(s);
      }
      t && (this.c && p(13), this.p = null);
    }, r.prototype.register = function (n) {
      this.o[n.compression] = n;
    }, r;
  }(),
  Jn = typeof queueMicrotask == "function" ? queueMicrotask : typeof setTimeout == "function" ? setTimeout : function (r) {
    r();
  };
exports.Unzip = zt;
exports.AsyncUnzipInflate = mt;
exports.UnzipInflate = wt;
exports.UnzipPassThrough = nt;
function xt(r, n, t) {
  t || (t = n, n = {}), typeof t != "function" && p(7);
  var e = [],
    i = function () {
      for (var m = 0; m < e.length; ++m) e[m]();
    },
    a = {},
    o = function (m, v) {
      Jn(function () {
        t(m, v);
      });
    };
  Jn(function () {
    o = t;
  });
  for (var s = r.length - 22; P(r, s) != 101010256; --s) if (!s || r.length - s > 65558) return o(p(13, 0, 1), null), i;
  var u = W(r, s + 8);
  if (u) {
    var f = u,
      h = P(r, s + 16),
      l = h == 4294967295;
    if (l) {
      if (s = P(r, s - 12), P(r, s) != 101075792) return o(p(13, 0, 1), null), i;
      f = u = P(r, s + 32), h = P(r, s + 48);
    }
    for (var g = n && n.filter, z = function (m) {
        var v = br(r, h, l),
          x = v[0],
          M = v[1],
          U = v[2],
          w = v[3],
          I = v[4],
          S = v[5],
          A = dr(r, S);
        h = I;
        var c = function (C, q) {
          C ? (i(), o(C, null)) : (q && (a[w] = q), --u || o(null, a));
        };
        if (!g || g({
          name: w,
          size: M,
          originalSize: U,
          compression: x
        })) {
          if (!x) c(null, X(r, A, A + M));else if (x == 8) {
            var L = r.subarray(A, A + M);
            if (M < 32e4) try {
              c(null, Mn(L, new D(U)));
            } catch (C) {
              c(C, null);
            } else e.push(fr(L, {
              size: U
            }, c));
          } else c(p(14, "unknown compression type " + x, 1), null);
        } else c(null, null);
      }, y = 0; y < f; ++y) z(y);
  } else o(null, {});
  return i;
}
function At(r, n) {
  for (var t = {}, e = r.length - 22; P(r, e) != 101010256; --e) (!e || r.length - e > 65558) && p(13);
  var i = W(r, e + 8);
  if (!i) return {};
  var a = P(r, e + 16),
    o = a == 4294967295;
  o && (e = P(r, e - 12), P(r, e) != 101075792 && p(13), i = P(r, e + 32), a = P(r, e + 48));
  for (var s = n && n.filter, u = 0; u < i; ++u) {
    var f = br(r, a, o),
      h = f[0],
      l = f[1],
      g = f[2],
      z = f[3],
      y = f[4],
      m = f[5],
      v = dr(r, m);
    a = y, (!s || s({
      name: z,
      size: l,
      originalSize: g,
      compression: h
    })) && (h ? h == 8 ? t[z] = Mn(r.subarray(v, v + l), new D(g)) : p(14, "unknown compression type " + h) : t[z] = X(r, v, v + l));
  }
  return t;
}
var _default = null;
exports.default = _default;

},{}]},{},[3]);
