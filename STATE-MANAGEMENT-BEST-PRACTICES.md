# State Management Best Practices

# Hook-less update functions

Notice, there is no `setCounter` function returned by the useValue hook. 
One of the distiguishing features of Nird is that your Component doesn't 
have to subscribe to the changes of the hooks. 

You can update Atom value by simple functions. 
You don't need to call the hook to create new function every render. 

There several benefits to it:
- component doesn't have to re-render if they use just the update callbacks
- with less re-renders, the app gets better performance
- you don't have to write `useCallback`, `useMemo` and other caching code for your update callbacks. 
- you avoid complicated cache callback bugs of `useEffect` and event listeners.
- you write less code, and your code is more readable

So, this way the only case your components re-render is the actual 
change of the atom they implicitly subscribed to using the `useValue` hook.

### Composable interactions

Quite often you need to perform multiple state changes per single action of the user. 
For example, when user creates a new slide then they expect that:
- (1) a new slide appears in the list of the slides
- (2) and new slide becomes selected in the list of the slides

The code to perform these two actions together is actually simple and familiar function composition:

```jsx
// file: slide-commands.ts

import { createNewEmptyAfterCurrentSlide } from "@state/slideList"
import { switchToNextSlide } from "@state/slideList"


const createNewSlideAfterCurrentSlide = () => {
  createNewEmptyAfterCurrentSlide();
  switchToNextSlide();
}

```



## Layered applications

For larger project, mc recommends to split state operation and user actions code into two separate layers.

### State actions layer

The state actions are simple JavaScript functions on top of the state atoms.

The state actions code knows nothing about user actions, DOM, UI, HTML and Components. 

This layer contains all the business logic of application and it stays easy-to-test.


### User interface commands

User interface commands are build on top of state actions. 

User interface commands know all about the hovers, mousedowns, clicks, drags, keypresses, onChanges
of your application and make it smooth for users.

This way, all the UI-complication doesn't get mixed up with the business logic.

For even larger projects it might make sense to move state actions of a specific business domain to a dedicated workspace package.

### Self-documenting functions

A JavaScript function declaration is a great descriptor for the action it performs. 
Moreover, it is obvious and familiar documentation of how to use it. 

When you declare your actions as functions, you automatically get:
- descriptive function name
- descriptive list of parameters
- descriptive type of parameters
- optional, js-doc.

And you lose this clarity when you are forced to:
- create lists of strings for names of actions
- implement switch/case clauses
- write "reducer" code
- wrap actions into hooks, `useMemo` or `useCallback`


### Contained state modifications

Notice that `counterAtom` is not exported directly. 
This way we avoid unexpected direct modifications of the atom we created.

Instead, we create and expose micro-API to interact with the atom. 


When you don't expose raw set-state API to the world, your atoms transition from one meaningful state to the another.
There is no transitional or partially correct state of the atoms.

No arbitrary code is able to modify the state of your atoms. 

When you refactor you code or fix a bug, you are certain that you only have a single place to make change to or to review.


