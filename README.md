Present and code
======================
Application that allows to do a presentation with a code panel so you can show code examples while you do the presentation.

The application is  built using Web Sockets and allows many people to join the same presentation and see the updates or even edit the presentation themselves.

You can access it on heroku here: http://present-and-code.herokuapp.com/

Using it
------
To upload a presentation the file you upload must have the following format:

<section class="slide">
 slide 1 ...
</section>
<section class="slide">
  slide 2
</section>

<a href="#" class="deck-prev-link" title="Previous">&#8592;</a>
<a href="#" class="deck-next-link" title="Next">&#8594;</a>

<!-- SECTION -->
code for slide 1 .....
<!---->
code for slide 2 ......
<!-- SECTION -->
<section class="slide">
.........
</section>

The first section contains the Slides for the presentation. This is using deck.js so you can use the syntax options it offers.

The second section is for prepopulating the code panel for each slide. When a slide is selected the code for that slide will be shown.

The third section contains the slide for the problem. In this case the code panel will be empty to begin with.

Accessing presentations
------

To access a presentation you simply put the name of the session plus the name of the presentation in the top right text field and press enter.
For example if you want to access the presentation "rails_controllers" and there  is a session with that presentation named "session1", you simply put "session1/rails_controllers" and press Enter.
If there is yet no session created for that name and presentation, a new session will be created the first time the session name is used. Every one else that uses the session and presentation will join the already running session.


Company
--------
  [image]: http://www.caciquetechnologies.co.uk/uploads/1/3/5/3/135381/1356613741.png "Cacique"


License
----------
Copyright &copy; 2013 Carlo Scarioni
Licensed and Distributed under the [MIT License][mit].

[MIT]: http://www.opensource.org/licenses/mit-license.php
