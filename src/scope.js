(function($, $$) {

var _ = Wysie.Scope = $.Class({
	extends: Wysie.Unit,
	constructor: function (element, wysie, collection) {
		this.properties = {};

		this.scope = this;

		Wysie.hooks.run("scope-init-start", this);

		// Should this element also create a primitive?
		if (Wysie.Primitive.getValueAttribute(this.element)) {
			var obj = this.properties[this.property] = new Wysie.Primitive(this.element, this.wysie);
			obj.scope = obj.parentScope = this;
		}

		// Create Wysie objects for all properties in this scope (primitives or scopes),
		// but not properties in descendant scopes (they will be handled by their scope)
		$$(Wysie.selectors.property, this.element).forEach(element => {
			var property = element.getAttribute("property");

			if (this.contains(element)) {
				var existing = this.properties[property];

				if (existing) {
					// Two scopes with the same property, convert to static collection
					var collection = existing;

					if (!(existing instanceof Wysie.Collection)) {
						collection = new Wysie.Collection(existing.element, this.wysie);
						collection.parentScope = this;
						this.properties[property] = existing.collection = collection;
						collection.add(existing);
					}

					if (!collection.mutable && Wysie.is("multiple", element)) {
						collection.mutable = true;
					}

					collection.add(element);
				}
				else {
					// No existing properties with this id, normal case
					var obj = Wysie.Node.create(element, this.wysie);
					obj.scope = obj instanceof _? obj : this;

					obj.parentScope = this;
					this.properties[property] = obj;
				}
			}
		});

		Wysie.hooks.run("scope-init-end", this);
	},

	get propertyNames () {
		return Object.keys(this.properties);
	},

	getData: function(o) {
		o = o || {};

		var ret = this.super.getData.call(this, o);

		if (ret !== undefined) {
			return ret;
		}

		ret = {};

		this.propagate(obj => {
			if ((!obj.computed || o.computed) && !(obj.property in ret)) {
				var data = obj.getData(o);

				if (data !== null || o.null) {
					ret[obj.property] = data;
				}
			}
		});

		$.extend(ret, this.unhandled);

		if (o.relative && self.Proxy && ret) {
			ret = new Proxy(ret, {
				get: (data, property) => {
					if (property in data) {
						return data[property];
					}

					// Look in ancestors
					var ret = this.walkUp(scope => {
						if (property in scope.properties) {
							// TODO decouple
							scope.expressions.updateAlso.add(this.expressions);

							return scope.properties[property].getData(o);
						};
					});

					if (ret !== undefined) {
						return ret;
					}
				},

				has: (data, property) => {
					if (property in data) {
						return true;
					}

					// Property does not exist, look for it elsewhere

					// First look in ancestors
					var ret = this.walkUp(scope => {
						if (property in scope.properties) {
							return true;
						};
					});

					if (ret !== undefined) {
						return ret;
					}

					// Still not found, look in descendants
					ret = this.find(property);

					if (ret !== undefined) {
						if (Array.isArray(ret)) {
							ret = ret.map(item => item.getData(o))
							         .filter(item => item !== null);
						}
						else {
							ret = ret.getData(o);
						}

						data[property] = ret;

						return true;
					}
				}
			});
		}

		return ret;
	},

	getRelativeData: function() {
		return this.getData({
			dirty: true,
			computed: true,
			null: true,
			relative: true
		});
	},

	/**
	 * Search entire subtree for property, return relative value
	 * @return {Wysie.Unit}
	 */
	find: function(property) {
		if (this.property == property) {
			return this;
		}

		if (property in this.properties) {
			return this.properties[property].find(property);
		}

		for (var prop in this.properties) {
			var ret = this.properties[prop].find(property);

			if (ret !== undefined) {
				return ret;
			}
		}
	},

	propagate: function(callback) {
		$.each(this.properties, (property, obj) => {
			obj.call.apply(obj, arguments);
		});
	},

	save: function() {
		if (this.placeholder) {
			return false;
		}

		this.everSaved = true;
		this.unsavedChanges = false;
	},

	done: function() {
		$.unbind(this.element, ".wysie:edit");
	},

	import: function() {
		this.everSaved = true;
	},

	propagated: ["save", "done", "import"],

	// Inject data in this element
	render: function(data) {
		if (!data) {
			return;
		}

		data = data.isArray? data[0] : data;

		// TODO what if it was a primitive and now it's a scope?
		// In that case, render the this.properties[this.property] with it

		this.unhandled = $.extend({}, data, property => {
			return !(property in this.properties);
		});

		this.propagate(obj => {
			obj.render(data[obj.property]);
		});

		this.save();
	},

	// Check if this scope contains a property
	// property can be either a Wysie.Unit or a Node
	contains: function(property) {
		if (property instanceof Wysie.Unit) {
			return property.parentScope === this;
		}

		return property.parentNode && (this.element === property.parentNode.closest(Wysie.selectors.scope));
	},

	static: {
		all: new WeakMap(),

		normalize: function(element) {
			// Get & normalize typeof name, if exists
			if (Wysie.is("scope", element)) {
				var type = element.getAttribute("typeof") || element.getAttribute("itemtype") || "Item";

				element.setAttribute("typeof", type);

				return type;
			}

			return null;
		}
	}
});

})(Bliss, Bliss.$);
