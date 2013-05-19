App = Ember.Application.create({});

App.Store = DS.Store.extend({
  revision: 12,
  adapter: DS.FixtureAdapter
});

App.Router.map(function() {
  this.resource('about');
  this.resource('posts', function() {
    this.resource('post', {path: ':post_id'}, function() {
      this.route('edit');
    });
  });
});

App.DateFieldView = Ember.View.extend({

  templateName: 'date-field-view',

  textField: Ember.TextField.extend({

    value: function() {
      var date = this.get('parentView').get('value');
      return this.formatDate(date);
    }.property(),

    focusOut: function() {
      var parentView = this.get('parentView');
      var date = new Date(this.get('value'));

      if (isNaN(date)) {
        date = parentView.get('value');
        this.set('value', this.formatDate(date));
      }
      else {
        parentView.set('value', date);
        this.set('value', this.formatDate(date));
      }
    },

    formatDate: function(date) {
      return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    }

  }),

  picker: Ember.Button.extend({
    click: function() {
      this.parentView.calendar.show();
    }
  }),

  calendar: Ember.View.extend({

    monthName: 'hello',

    templateName: 'calendar-view',

    _daysInMonth: function(month,year) {
      return new Date(year, month, 0).getDate();
    }

  })

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

App.Post.FIXTURES = [{
  id: 1,
  title: 'The Unknown',
  author: 'Dan Cohen',
  intro: 'What is the unknown?',
  extended: 'This is amazing!',
  publishedAt: new Date(),
}];

var showdown = new Showdown.converter();

Ember.Handlebars.registerBoundHelper('markdown', function(input) {
  return new Handlebars.SafeString(showdown.makeHtml(input));
});

Ember.Handlebars.registerBoundHelper('date', function(date) {
  return moment(date).fromNow();
});
