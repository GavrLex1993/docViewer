# docViewer

## Description
This is a test task I completed that required displaying a multi-page document. In our case, the document was a set of pages in the form of images. The task required the user to be able to add/remove annotations (I also implemented editing functionality - use double click), and the annotations should support drag and drop (this had to be implemented independently, without using third-party libraries). The requirement for zooming in and out of the document also adds complexity (this complicates calculations for annotation positioning and display). The user also has the option to save annotations (without sending them to the server; simply displaying the data in the console).

## Pros and cons of implementation
- Almost all the code was written using new Angular tools (standalone components, Signals, OnPush strategy, etc.)
- I tried to build a architecture (within a limited time and without details) that would allow the application to be expanded in the future.
- I decomposed the application's pages and components.
- In my opinion, all the initial requirements of the task have been met and even a little more. If I spend more time on the application (including styling), then I can, probably, get a real small application.

## What can be improved
In my opinion, I'd work further on the zoom and drag-and-drop algorithm, as it's quite complex, and I might try other methods, such as using canvas. But in real life, I'd probably look at ready-made solutions from other libraries.

I'd also like to highlight that components and logic could be more decoupled. For example, I'd move the drag-and-drop functionality into a separate directive that could be universal and used for any component.
I'd also expand the functionality for adding different types of annotations, not just text but also images, icons, and so on. This would require adding additional abstractions with various implementations. The code would be more universal and cleaner in this case.

I'd also work on the application styling and perhaps try to improve the UX.
