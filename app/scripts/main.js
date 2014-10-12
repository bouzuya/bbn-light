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

  var savePostToCache = function(posts) {
    var sorted = posts.sort(function(p1, p2) {
      return p1.pubdate === p2.pubdate ? 0 : (p1.pubdate < p2.pubdate ? 1 : -1);
    });
    cache.posts = sorted;
    return sorted;
  };

  var loadPostsFromCache = function() {
    return cache.posts;
  };

  var renderPosts = function(posts) {
    $('.bbn-menu ul').empty();
    posts.filter(function(_, i) {
      return i < 30;
    }).forEach(function(post) {
      var pubdate = post.pubdate.substring(0, 10);
      var title = post.title;
      // var tags = post.tags.map(function(tag) {
      //   return '[' + tag + ']';
      // }).join('');
      var tags = '';
      var a = '<a>' + pubdate + ' ' + title + ' ' + tags + '</a>';
      var li = '<li>' + a + '</li>';
      var e = $(li);
      e.on('click', function() { fetchPost(post).then(renderPost); });
      $('.bbn-menu ul').append(e);
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

  var renderPost = function(post) {
    $('.bbn-main header h1').text(post.title);
    $('.bbn-main header .pubdate').text(post.pubdate);
    var tags = $('.bbn-main header .tags');
    tags.empty();
    (post.tags || []).forEach(function(tag) {
      var li = $('<li>' + tag + '</li>');
      tags.append(li);
    });
    $('.bbn-main .content').html(post.html);
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

    fetchPosts().then(savePostToCache).then(renderPosts);

    var searchBox = $('.search #q');
    searchBox.on('keypress', function() {
      setTimeout(search, 100);
    });
    searchBox.val(query);
    setTimeout(search, 100);
  });
})();
