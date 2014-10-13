/* global $: true */
(function () {
  'use strict';

  var cache = {};

  var fetchPosts = function() {
    return $.ajax({
      type: 'GET',
      url: 'http://blog.bouzuya.net/posts.json',
      dataType: 'json',
      crossDomain: 'true'
    }).then(null, function(xhr, status, err) {
      console.error(xhr);
      console.error(xhr.statusCode());
      console.error(status);
      console.error(err);
      throw new Error('posts.json load error');
    });
  };

  var savePostsToCache = function(posts) {
    var sorted = posts.sort(function(p1, p2) {
      return p1.pubdate === p2.pubdate ? 0 : (p1.pubdate < p2.pubdate ? 1 : -1);
    });
    cache.posts = sorted;
    return sorted;
  };

  var loadPostsFromCache = function() {
    return cache.posts || [];
  };

  var renderPosts = function(posts) {
    var articleList = $('.article-list');
    articleList.empty();
    posts.filter(function(_, i) {
      return i < 31;
    }).forEach(function(post) {
      // <li class="article-list-item">
      //   <article class="article">
      //     <header class="article-header">
      //       <h1 class="title"></h1>
      //       <span class="pubdate"></span>
      //       <ul class="tags"></ul>
      //     </header>
      //     <div class="content"></div>
      //   </article>
      // </li>
      var title = $('<h1 class="title">' + post.title + '</h1>');
      var pubdate = '<span class="pubdate">' + post.pubdate.substring(0, 10) + '</span>';
      var tags = '<ul class="tags"></ul>';
      var header = $('<header class="article-header"></header>');
      header.append(title);
      header.append(pubdate);
      header.append(tags);
      var content = '<div class="content"></div>';
      var article = $('<article class="article"></article>');
      article.append(header);
      article.append(content);
      var li = $('<li class="article-list-item"></li>');
      li.append(article);
      var articleListItem = li;
      title.one('click', function() {
        fetchPost(post).then(function(post) {
          renderPost(article, post);
        });
      });
      articleList.append(articleListItem);
    });
  };

  var fetchPost = function(post) {
    return $.ajax({
      type: 'GET',
      url: 'http://blog.bouzuya.net/posts/' + post.date + '.json',
      dataType: 'json',
      crossDomain: 'true'
    }).then(null, function(xhr, status, err) {
      console.error(xhr);
      console.error(xhr.statusCode());
      console.error(status);
      console.error(err);
      throw new Error('posts.json load error');
    });
  };

  var renderPost = function(article, post) {
    var title = article.find('.title');
    var tags = article.find('.tags');
    var content = article.find('.content');
    tags.empty();
    (post.tags || []).forEach(function(tag) {
      var li = $('<li class="tag">' + tag + '</li>');
      tags.append(li);
    });
    content.html(post.html);
    title.one('click', function() {
      tags.empty();
      content.empty();
      title.one('click', function() {
        fetchPost(post).then(function(post) {
          renderPost(article, post);
        });
      });
    });
  };

  var search = function() {
    var searchBox = $('.search #q');
    var keywords = searchBox.val().split(new RegExp('\\s+'));
    $('#search-query').text(keywords.join(', '));
    var posts = loadPostsFromCache();
    var filtered = posts.filter(function(post) {
      return keywords.every(function(keyword) {
        return post.title.indexOf(keyword) >= 0 ||
          post.pubdate.indexOf(keyword) >= 0 ||
          (post.tags || []).some(function(tag) {
            return tag.indexOf(keyword) >= 0;
          });
      });
    });
    $('#search-result').text(filtered.length + ' entries');
    renderPosts(filtered);
  };

  $(document).ready(function() {
    console.log('document ready');

    var query = location.search
      .replace(new RegExp('\\?q=(.+)'), '$1')
      .split('+').join(' ');

    fetchPosts().then(savePostsToCache).then(renderPosts);

    var searchBox = $('.search #q');
    searchBox.on('keypress', function() {
      setTimeout(search, 100);
    });
    searchBox.val(query);
    setTimeout(search, 100);
  });
})();
