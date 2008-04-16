/*

	TODO: Option in initialize to set default error message
 	TODO: Option to validate entire form when the page loads
	
*/

var Validator = Class.create();

Validator.prototype = {

	// error message to display if one wasn't specified to addField()
	defaultErrorMessage:'This field is invalid',
	defaultValidMessage:'',

	// array of errors
	errors:$A([]),

	// array of valid fields
	valid:$A([]),
	
	// array of fields that will be validated
	fields:$A([]),
	
	// the form that this validator applies to
	form_obj:null,
	
	// name of the CSS class to give any inputs with errors
	errorClass:'error',
	
	errorIcon:'/images/cross.png',

	// name of the CSS class to give any inputs that are valid
	validClass:'valid',
	
	validIcon:'/images/accept.png',

	// when to do validation (submit|blur)
	whenToValidate:'submit',
	
	// some default fields that you can get by just naming them in your addField() call
	basicValidations:{
		'notBlank':{	'method':function(v) { return v=='' ? false : true }, 
						'errorMessage':'This field cannot be blank'},
		'isNumeric':{	'method':function(v) { return parseInt(v) == v ? true : false }, 
						'errorMessage':'This field must be a number'},
		'isEmail':{		'method':function(v) { return v.match(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i) ? true : false },
						'errorMessage':'Please enter a valid email address (johndoe@example.com)'}
	},
	
	// initialize the validator with the form that this validates for
	initialize:function(id, options) {
		this.form_obj = $(id);
		options = options ? options : {};

		options.event ? this.whenToValidate = options.event : null;
		options.errorClass ? this.errorClass = options.errorClass : null;
		options.validClass ? this.errorClass = options.validClass : null;
		options.errorIcon ? this.errorIcon = options.errorIcon : null;
		options.validIcon ? this.validIcon = options.validIcon : null;

		// if we're going to validate on submit, add an event handler to the form
		if(this.whenToValidate == 'submit') {
			this.form_obj.observe('submit', this.validateForm.bindAsEventListener(this));
		}

		// automatically add any fields with a class of 'required'
		$$('input.required').each(function(field) {
			this.addField(field, this.basicValidations['notBlank'].method, { errorMessage:this.basicValidations['notBlank'].errorMessage });
		}.bind(this));
		
		if(options.validateOnLoad) {
			Event.observe(window, 'load', this.validateForm.bindAsEventListener(this));
		}

	},
	
	// add a field to validate
	addField:function(id,func,options) {
		var obj = $(id);

		// if there were no options passed in, create an empty object
		options = options ? options : {};
		// was this a string for one of the built-in validation routines?
		if(typeof func == 'string') {
			var built_in_name = func;
			func = this.basicValidations[built_in_name].method;
			// if so, should we use the default error message?
			if(!options.errorMessage) {
				options.errorMessage = this.basicValidations[built_in_name].errorMessage;
			}
		}
		options.errorMessage = options.errorMessage ? options.errorMessage : this.defaultErrorMessage;		// if no errorMessage was passed in, set the default one
		options.validMessage = options.validMessage ? options.validMessage : this.defaultValidMessage;		// if no validMessage was passed in, set the default one
		options.appendResultTo = options.appendResultTo ? $(options.appendResultTo) : obj;						// should we append the result to any field other than the default?

		this.fields.push({	obj:obj,
							method:func,
							errorMessage:options.errorMessage,
							validMessage:options.validMessage,
							appendResultTo:options.appendResultTo });

		if(options.event) {
			// if this field specified a custom event watch type, use it
			obj.stopObserving(options.event);
			obj.observe(options.event, this.validateField.bindAsEventListener(this));
		} else if(this.whenToValidate != 'submit') {
			// if we're not validating on submit, then observe whichever other event type was specified
			obj.stopObserving(this.whenToValidate);
			obj.observe(this.whenToValidate, this.validateField.bindAsEventListener(this));
		}
	},
	
	// validate all the fields in the form
	validateForm:function() {
		this.resetForm();
		this.fields.each(function(field) {
			this.validateField(field);
		}.bind(this));
		return this.hasErrors() ? false : true;
	},

	// validate a specific field
	validateField:function(e) {
		// is this being called as the result of an event being fired, or did we call it directly?
		var obj = e.element ? e.element() : $(e);
		var fields = this.fields.select(function(field) {
			return obj == field.obj ? true : false;
		});

		if(fields) {
			this.resetField(fields[0]);
			// for each field that matched, first check to see if it already has an error and if not, then validate
			fields.each(function(field) {
				if(!this.fieldHasErrors(field)) {
					if(field.method($F(field.obj))) {
						this.setFieldAsValid(field);
					} else {
						this.setFieldAsError(field);
					}
				}
			}.bind(this));
		}
	},

	fieldHasErrors:function(field) {
		return this.errors.find(function(error) {
			return error.obj == field.obj ? true : false;
		});
	},
	
	// add an error
	setFieldAsError:function(field) {
		// remove any existing valids on this field
		this.resetField(field);
		this.errors.push(field);
		field.obj.addClassName(this.errorClass);
		var output = '<div id="' + field.obj.id + '_result" class="result error"><img src="' + this.errorIcon + '" alt="" /> ' + field.errorMessage + '</div>';
		field.appendResultTo.insert({after:output});
	},

	setFieldAsValid:function(field) {
		this.valid.push(field);
		field.obj.addClassName(this.validClass);
		var result_obj = $(field.obj.id+'_result');
		if(!result_obj) {
			var output = '<div id="' + field.obj.id + '_result" class="result valid"><img src="' + this.validIcon + '" alt="" /> ' + field.validMessage + '</div>'
			field.appendResultTo.insert({after:output});
		}
	},
	
	hasErrors:function() {
		return this.errors.length == 0 ? false : true;
	},
	
	// reset the validator by removing all errors
	resetForm:function() {
		this.errors = $A([]);
		this.fields.each(function(validation) {
			this.resetField(field);
		}.bind(this));
	},
	
	resetField:function(field) {
		field.obj.removeClassName(this.errorClass);
		field.obj.removeClassName(this.validClass);
		var result_obj = $(field.obj.id+'_result');
		if(result_obj) {
			result_obj.remove();
		}
		// remove field from the errors array
		this.errors.each(function(error) {
			if (field.obj == error.obj) {
				this.errors = this.errors.without(error);
			}
		}.bind(this));
		// remove field from the valid array
		this.valid.each(function(valid) {
			if (field.obj == valid.obj) {
				this.valid = this.valid.without(valid);
			}
		}.bind(this));
	},
	
	// a nice formatted <div> that contains the errors in english
	// accepts the 'id' of an element whose contents will be replaced with the errors
	getErrorMessages:function(id) {
		var obj = $(id);
		var output = '<h2>The form could not be submitted because of the following errors:</h2>';
		output += '<ul>';
		this.errors.each(function(error) {
			output += '<li>' + error.errorMessage + '</li>';
		});
		output += '</ul>';
		obj.update(output);
	}
	
}