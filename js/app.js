App = Ember.Application.create({});

App.Store = DS.Store.extend({
  revision: 12,
  adapter: DS.FixtureAdapter
});

App.Router.map(function() {
  this.resource('about');
  this.resource('posts', function() {
    this.route('show', {path: '/:post_id'})
    this.route('edit', {path: '/:post_id/edit'});
  });
});

App.DateFieldView = Ember.ContainerView.extend({

  init: function() {
    this._super();

    var self = this;
    this.calendarController = App.CalendarController.create();
    this.calendarController.addObserver('currentDate', function() {
      self.textField.set('value', (this.get('currentMonth') + 1) + '/' + this.get('currentDate') + '/' + this.get('currentYear'));
      self.textField.$().focus();
    })
    this.pushObject(App.CalendarView.create({controller: this.calendarController}));
  },

  childViews: ['textField', 'triggerView'],

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

  triggerView: Ember.View.extend({
    tagName: 'button',

    template: Ember.Handlebars.compile('TRIGGER'),

    click: function() {
      var controller = this.get('parentView').get('calendarController');
      var isShown    = controller.get('isShown');
      controller.set('isShown', !isShown);
    }
  })

});

App.PostsEditRoute = Ember.Route.extend({

  model: function(params) {
    return App.Post.find(params.post_id);
  }

});

App.PostsShowRoute = Ember.Route.extend({

  model: function(params) {
    return App.Post.find(params.post_id);
  }

});

App.PostsEditController = Ember.ObjectController.extend({

  doneEditing: function() {
    this.get('store').commit();
    this.transitionToRoute('posts.show', this.content);
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

App.PostsController = Ember.Controller.extend({
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


//===================================================================

var MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December" ];

App.CalendarView = Ember.View.extend({
  templateName: 'calendar-view',

  calendarDayView: Ember.View.extend({
    click: function(evt) {
      var date = parseInt(evt.target.innerText);
      this.get('controller').send('selectDate', date);
    }
  })
});

App.CalendarController = Ember.ObjectController.extend({
  incrementMonth: function() {
    var month = this.get('currentMonth');
    if (month === 0) {
      this.set('currentMonth', 11);
      this.decrementProperty('currentYear');
    } else {
      this.decrementProperty('currentMonth');
    }
  },

  decrementMonth: function() {
    var month = this.get('currentMonth');
    if (month === 11) {
      this.set('currentMonth', 0);
      this.incrementProperty('currentYear');
    } else {
      this.incrementProperty('currentMonth');
    }
  },

  isShown: false,

  currentDate: 1,

  currentYear: new Date().getFullYear(),

  currentMonth: new Date().getMonth(),

  selectDate: function(date) {
    this.set('currentDate', date);
    this.set('isShown', false);
  },

  currentMonthName: function() {
    return MONTH_NAMES[this.get('currentMonth')];
  }.property('currentMonth'),

  daysInMonth: function() {
    var date = this.get('date');
    var noOfDays = new Date(this.get('currentYear'), this.get('currentMonth') + 1, 0).getDate();
    var days = [];
    for (var i = 0; i < noOfDays; i += 1) {
      days.push(i + 1);
    }
    return days;
  }.property('currentMonth')
});
