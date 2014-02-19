Validator is a Javascript framework for simple client-side validation of form fields.

Server-side validation is essential, but client-side validation gives the user
immediate feedback as they're filling out a form and can save a round-trip to the
server just to find out that a password was one character too short. Client-side
validation can't tell you if a value is already taken in the database, but it's
perfect for determining if a field is blank, too short or meets a certain format
guideline (valid email address, 10-digit phone number, etc.).


Requirements
============
Validator relies on Prototype: http://prototypejs.org


Starting up Validator
=====================
To include Validator on your page, simply include a <script> tag to the .js files:

  <script type="text/javascript" src="/javascripts/prototype.js"></script>
  <script type="text/javascript" src="/javascripts/validator.js"></script>

To use Validator you need a valid <form> and some form elements on the page. That
form has to have an id -- Validator references the id to know which form to
validate (you can have multiple forms on a page, and multiple Validators checking
them). 

At some point in your code *after* the closing </form> tag, you're going to open a
script block and create an instance of Validator:

  <script type="text/javascript">
    var v = new Validator('my_form');
  </script>

Where 'my_form' is whatever the id of your form is. Specifiying the id of the form
is required because you could have multiple forms and multiple Validators checking
them. Now the validator is ready to go. By default the validator will validate the
entire form at once when you submit it (either by clicking an input of type="submit"
or submitting it via Javascript). If any field is invalid, the submission will be 
cancelled and the invalid fields will be noted (see "How Fields are Marked
Valid/Invalid" below).


Validating Fields
=================
The easiest validation you can do is to add a class="required" to any field you
want to automatically be checked for blank-ness. If the value of a field with the
"required" class is empty (value == '') when checked, it will be marked invalid.

  <input type="text" name="first_name" id="first_name" class="required" />

When you want some fancier validations you'll start adding some Javascript.
The basic format is:
  
  1. Let the Validator know which field to validate
  2. Tell it how to determine the field's validity
  3. (optional) What to tell the user when the result is valid or invalid (the
     Validator will include a default invalid message if you don't specify your own)

There are several other options that go along with #3, but we'll get into those
later.

First, a basic example:

  <script type="text/javascript">
    var v = new Validator('my_form');
    v.addField('first_name','notBlank');
  </script>

We call the Validator's addField() method to add a field to the Validator. The
first parameter is the id of the field and the second is how to validate it.

There are a few built-in validations, which you call by name -- in this case
"notBlank." (This is the same validation that's used if you add a class="required"
to your form field.)  You can also pass an anonymous function as the second parameter.
This is where the real power of the Validator comes through, as this function
can be whatever you want. If the function returns true, the field is valid. If
it returns false, the field is invalid. Simple as that.

Here's the same validation using an anonymous function:

  <script type="text/javascript">
    var v = new Validator('my_form');
    v.addField('first_name', function(v) { return v == '' ? false : true });
  </script>

The anonymous function will be invoked with the value of the field specified in
the first parameter to addField() (in this case, whatever is in the 'first_name'
textbox). In this example the function puts the value of the field into 'v' and 
then checks if v is an empty string. If it is, return false because the field is 
invalid. Otherwise return true. This is also the function that 'notBlank' runs 
behind the scenes.

A slightly more complex example:

  <script type="text/javascript">
    var v = new Validator('my_form');
    v.addField( 'phone_number', 
                function(v) { 
		  if (v.match(/\d{3}-\d{3}-\d{4}/)) {
		    return true;
		  } else {
		    return false ;
		  }
		}
              );
  </script>

This validation checks that the phone number matches a certain format, namely
xxx-xxx-xxxx where 'x' must be a digit. This function was broken into multiple
lines for clarity, and uses the regular if/else syntax rather than the shorter
?: syntax, all of which is perfectly valid and may make it easier to read (just
make sure you get your } and )'s correct!).

Now that you know how to validate a field, what happens when it gets validated?


How Fields are Marked Valid/Invalid
===================================
When a field is validated and found to be valid or invalid, two things occur:

  1. A class is added to the valid/invalid field
  2. A <div> containing an error message is inserted into the HTML on the page

Error/Valid Classes
-------------------
By default, if a field is found to be invalid, a class of "error" is added to the
invalid field. Likewise, if a field is found to be valid, a class of "valid" is
added to the field. So, if we're validing that 'first_name' isn't blank, and it
is, after the validation the field will look like:

  <input type="text" name="first_name" id="first_name" class="error" />

If this was validated by means of the auto class="required"-type validation,
the field would look like:

  <input type="text" name="first_name" id="first_name" class="required error" />

The "error" class is simply appended to the list of classes already on the field.
If a field is valid, the same rules apply as above, only the class added is
"valid" instead of "error."

What good does this do you? Well, you can set a CSS rule that all <input> fields
with an "error" class have a 2 pixel red border, for example. Or you can ignore
the class altogether if you don't want to highlight the field.

"Am I forced to only use 'error' and 'valid' as my class names?"  No. See
"Customizing the Validator" section below for info.

Error/Valid Message
-------------------






Built-in Validation Methods
===========================
Using a built-in validation is as simple as passing its name as a string in the
second parameter of addField().

'notBlank' : the field is not blank
'isNumber' : the field is a number
'isEmail' : the field has the format of a valid email address




Customizing Validator
=====================



Method Summary
==============
addField(fieldName, validationMethod, options)

Where 'options' is a hash of key/value pairs. Available options are:

  event : The event type which, when fired, will cause this field to be
          validated (by default, individual fields aren't validated until the
	  entire form is submitted)
  errorMessage : The message to show when a field is invalid
  validMessage : The message to show when a field is valid
  appendResultTo : the id of a field to append the 'result' <div> to
                   (by default, the field that's being validated)
