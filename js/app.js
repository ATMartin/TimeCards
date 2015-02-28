use strict';

$.ajaxSetup({ 
  headers: {
    "X-Parse-Application-Id" : "K4zLqJj9DKABboTYQLeVyeQVBlhqOtJO7CrTQIEq",
    "X-Parse-REST-API-Key" : "Y7V0uUBdUqCe9sVMx1ZWEkllLDgxaJtp5tYCoTa7"
  }
});

var TimeCard = {
   start: function() {
    TimeCard.router = new TimeCard.AppRouter();
    Backbone.history.start();
   }
};

TimeCard.AppRouter = Backbone.Router.extend({
  routes: {
    '' : 'index' 
  }, 
  initialize: function() {
    TimeCard.vent = _.extend({}, Backbone.Events);
    TimeCard.events = new TimeCard.EventLog();
    TimeCard.newCardForm = new TimeCard.NewCardView({
      el: '#new-card'
    });
    //TimeCard.testCard = new TimeCard.CardView({
    //  model: new TimeCard.Event()
    //});
    TimeCard.cardList = new TimeCard.CardListView({
      collection: TimeCard.events   
    });  
    TimeCard.showLog = new TimeCard.ShowLogView({
      el: '#show-log'
    });
    TimeCard.timer = new TimeCard.TimerView({
      el: '.timer-container'
    });
  },
  index: function() {
    TimeCard.newCardForm.render();
    //TimeCard.testCard.render();
    TimeCard.cardList.render();
    TimeCard.showLog.render();
    TimeCard.timer.render();
    TimeCard.events.fetch();
  }  
});

TimeCard.Event = Backbone.Model.extend({
  idAttribute: 'objectId',
  defaults: function(opts) {
    opts = opts || {};
    return _.defaults(opts, {
      title: 'DEFAULT',
      color: '#112233',
      times: [] 
    });
  }
});

TimeCard.EventLog = Backbone.Collection.extend({
  model: TimeCard.Event,
  url: "https://api.parse.com/1/classes/TimeCard",  
  parse: function(res) { return res.results; }
});

TimeCard.NewCardView = Backbone.View.extend({
  template: _.template($('[data-template="new-card"]').text()),
  initialize: function() {},
  render: function() {
    this.$el.append(this.template({}));
    return this;  
  }
}),

TimeCard.CardListView = Backbone.View.extend({
  el: '#card-list',
  initialize: function() {
    this.listenTo(this.collection, "add sync destroy", this.render);
  },
  render: function() {
    var els = [];
    this.$el.empty();
    this.collection.each(function(card) {
      var newCard = new TimeCard.CardView({model: card});
      newCard.render();
      els.push(newCard.el);
    });
    this.$el.append(els);
    return this;
  }
});

TimeCard.CardView = Backbone.View.extend({
  className: 'card',
  template: _.template($('[data-template="card"]').text()),
  initialize: function() {},
  events: {
    'click .toggle' : 'toggleTimer'
  },
  toggleTimer: function() {
    if (!TimeCard.vent.timer) {
      TimeCard.vent.trigger('startTimer');
    } else {
      TimeCard.vent.trigger('stopTimer');
    }
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));  
    return this;
  }  
});

TimeCard.TimerView = Backbone.View.extend({
  template: _.template($('[data-template="timer"]').text()),
  initialize: function() {
    this.time = 0;
    this.listenTo( TimeCard.vent, 'startTimer', this.startTimer);
    this.listenTo( TimeCard.vent, 'stopTimer', this.stopTimer);  
    this.render();
  },
  startTimer: function() {
    var self = this;
    TimeCard.vent.timer = true;
    this.timer = setInterval(
      function() { 
      self.time += 1; 
      self.render(); 
    }, 1000);
  },
  stopTimer: function() {
    TimeCard.vent.timer = false;
    clearInterval(this.timer);
  },
  render: function() {
    $('.timer-container').html(this.template({time: this.time}));
    return this;
  }  
});

TimeCard.ShowLogView = Backbone.View.extend({
  template: _.template($('[data-template="show-log"]').text()),
  initialize: function() {},
  render: function() {
    this.$el.append(this.template({}));
    return this;
  }
});


$(document).ready(function() {
  TimeCard.start(); 
});
