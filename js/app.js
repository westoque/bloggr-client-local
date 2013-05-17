App = Ember.Application.create({});

App.Store = DS.Store.extend({
  revision: 12,
  adapter: DS.LSAdapter.create({
    namespace: 'bloggr-client'
  })
});

App.Router.map(function() {
  this.resource('about');
  this.resource('posts', function() {
    this.resource('post', {path: ':post_id'}, function() {
      this.route('edit');
    });
  });
});

App.PostEditRoute = Ember.Route.extend({

  model: function(params) {
    return this.modelFor('post');
  }

});

App.PostEditController = Ember.ObjectController.extend({

  doneEditing: function() {
    this.get('store').commit();
    this.transitionToRoute('post', this.content);
  }

});

App.PostIndexRoute = Ember.Route.extend({

  model: function(params) {
    return this.modelFor('post');
  }

});

App.IndexRoute = Ember.Route.extend({

  redirect: function() {
    this.transitionTo('posts');
  }

});

App.PostsRoute = Ember.Route.extend({
  model: function() {
    return App.Post.find();
  }
});

var attr = DS.attr;

App.Post = DS.Model.extend({
  title: attr('string'),
  author: attr('string'),
  intro: attr('string'),
  extended: attr('string'),
  publishedAt: attr('date')
});

//App.Post.FIXTURES = [{
  //id: 1,
  //title: 'The Sexy Beast',
  //author: 'Dan Cohen',
  //intro: 'Whats up friends!',
  //extended: 'Yoyoyo!',
  //publishedAt: new Date()
//}];

var showdown = new Showdown.converter();

Ember.Handlebars.registerBoundHelper('markdown', function(input) {
  return new Handlebars.SafeString(showdown.makeHtml(input));
});

Ember.Handlebars.registerBoundHelper('date', function(date) {
  return moment(date).fromNow();
});
