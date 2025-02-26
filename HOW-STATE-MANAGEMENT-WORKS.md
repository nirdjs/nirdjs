# How state management works internally


Modern state management libaries, in addition to managing front-end state have to provide compatibility 
with Server-Side Rendering (SSR) and Server-Side Generation (SSG) rendering. In this mode, the page of 
the application are rendered in-parallel. This way every atom sits in the memory of the node application 
in multiple instances, one per every page being rendered. A specific state of all atoms and variables
required to render a single page is called Store.

Let's look at the example of a todo app which uses server-side rendering. 
When users request of the app simultateously request their todo-list page at the same time then their todo-list pages render 
separately and in parallel. One page and one store for every single user request. For different user the page has different data to show. 
But, the nodejs application has single memory space where it creates atoms, functions and other variables. Store

To distinguish page renders, tools like redux, recoil, jotai use ReactContext-based approach.
They use ReactContext providers at the root of the render tree and then use ReactContext on the leaves of the render tree.
This is why they force users to create callbacks using hooks in order to pass the rendering context to the hooks.

Unlike other libraries, Nird is using `AsyncLocalStorage` to pass rendering context to the callbacks and other functions. 
This way Nird stay independent from the `ReactContext` and does not require developers to write hooks for callbacks.
