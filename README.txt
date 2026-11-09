EVENT REGISTRATION SYSTEM
=========================

ABOUT
-----
An offline-first college Event Registration System built with:
- HTML
- CSS
- Vanilla JavaScript
- Browser Local Storage

NO INTERNET, SERVER, DATABASE INSTALLATION, OR EXTRA LIBRARIES ARE REQUIRED.

HOW TO RUN
----------

 Open the "Event_Registration_System" folder.
 Double-click index.html.
 It opens in your browser (Chrome, Edge, or Firefox).
 Start by adding events and students, then register students.

You can also open the folder in Visual Studio Code and use "Open with Live Server",
but Live Server is optional. Opening index.html directly works.

FEATURES
--------
1. Events: add, view, edit, delete, and set maximum capacity.
2. Students: add, view, edit, and delete student details.
3. Registration: register students for events and view participant lists.
4. Capacity: new registrations are blocked when registrations reach capacity.
5. Over-capacity alerts: if capacity is edited below the existing registration count,
   the event is highlighted. Existing registrations are preserved.
6. Search and filters for events, students, and registrations.
7. Participant counts and dashboard statistics.
8. Export and import JSON backups.

IMPORTANT DATA NOTES
--------------------
- Data is saved in the browser's Local Storage on the same device/browser.
- Do not clear browser site data if you want to keep your records.
- Export a JSON backup regularly to keep a portable copy.
- Importing a backup replaces the data currently stored in the browser.
- Deleting an event also deletes its registrations after confirmation.
- Deleting a student also deletes that student's registrations after confirmation.
- Reducing an event's capacity never deletes existing registrations.
- An event at capacity or over capacity will not accept new registrations.

PROJECT STRUCTURE
-----------------
Event_Registration_System/
  index.html
  style.css
  app.js
  README.txt

TROUBLESHOOTING
---------------
If the page does not update, refresh the browser.
If data appears missing, check that you are using the same browser and have not
cleared its local storage. Import your JSON backup if you have one.
