---
layout: post
title: 'On Gift Kitting, Chaos, and Why Build Robots'
subtitle: A messy task, a long day, and a clearer sense of things
cover-img: /assets/img/gift_kitting_ai.png
share-img: /assets/img/gift_kitting_ai.png
tags: AI, Robotics, Random
author: Aadarsh Ramachandran
readtime: true
---

Sometime last winter, I caught myself thinking about something I hadn’t really *felt* before — the actual need for intelligent robots. Of course, I know the usual arguments - repetitive work, automation, efficiency. But it all felt abstract.

I wanted to try experiencing it. And I got lucky.

There was an alumni meet at IIT Madras, and they were looking for volunteers to do some grunt work. I signed up for *gift kitting*, that is, to pack gift bags for all the attendees and there were more than a thousand. And that opened my eyes. I had no idea how much work goes into something like this, and how much of it is still very much a human problem.

### The Assembly Line That Wasn’t One

At first thought, the task sounds simple: Take a bag → open it → put in:

* a shirt
* a bottle
* a cap
* a greeting card and a couple of gifts like keychains, mementos, etc.

Then:

* find an ID card
* insert into its sleeve
* attach the string
* tie it to the bag
* stack the bags in batch

Repeat.

Now do this ~1000 times.

In chaos.

Everything was mixed — shirt sizes, colors, bottles, even mismatched labels. Some shirts didn’t have logos. Nothing was pre-sorted. You constantly had to verify, match, and correct.

For half a day, I was doing this alone. It wasn’t intellectually hard - just physically and mentally exhausting.

By evening, we became a system:

* one reads
* one sorts
* one fetches
* I assemble
* someone stacks

Five people doing what *feels* like a simple task. And that’s when it clicked.

### This Is Not “Automation-Friendly”

My first instinct was:

> This is exactly what robots should do.

But almost immediately:

> This is exactly what robots *cannot yet do well*.

And that gap became very interesting.

### Trying to Think Like a Robot (or Build One)

How does one go about overcoming the many challenges here?

#### “Simple” Pick-and-Place Isn’t Simple

Even for common items like greeting cards or keychains - how do you pick a thin card from a pile of greeting cards? How do you pick a keychain that’s tangled with others? 

#### T-Shirts

You’re given:

* a large box of mixed shirts
* different sizes
* covered in plastic (slippery, deformable)

Now the task becomes:

How to reach into a box and pull out a shirt out of many piles?   
As you proceed you need to reach deeper.

How to identify the correct size?    
The label on the shirt and on the cover may not match. The shirt may be folded in a way that hides the label. How do you manipulate the shirt (inside the plastic cover) to reveal the label? Sometimes deform it to get a better view. Sometimes uncover the plastic and check.

How do you sort and stack them?  
You can’t just place one on top of the other. You need to feel the stability of the stack and adjust placement accordingly. If it starts slipping, you need to stabilize it or split the stack. How do you sense that? How do you modulate your force to prevent the pile from collapsing?

#### ID Cards

This is deceptively hard even for humans. How to pick a thin card from a stack? How to open a tight sleeve? I put my finger in and do a little wiggle to create a gap, then insert the card. But how do you do that with a robot? How to force the card in? How to attach the string to it?

#### Bag Packing

Now, put it all in the bag.  
How to open the bag and create volume? How to insert items and pack them cleanly? How to handle the deformable nature of the bag and the items inside as you fill it?

Once a bag is packed, you need to tie the ID.  
How to tie a string to the bag's handle? The bag need not stand stable on its own, so you need to hold it while tying. 

#### The Long-Horizon Game

And then, which batch does this bag belong to? Where do I place it? How do I organize space as piles grow?

And all of this repeats for 1000 bags, in 1000 different ways. Each bag is a new problem. Each batch is a new problem.

### A Random Thought: Can This Be a Service?

At some point, the startup energy kicked in and I thought:

> Could I build a robot system that goes to events and handles this?

Weddings, conferences, large gatherings — they all have this problem. It's a huge amount of work and not a controlled factory floor.

The catch is you don't know anything beforehand. You can’t pre-engineer for specific items, specific layouts, or specific environments. You have to build a system that can adapt to any of this on the fly.

Honestly though, I wouldn’t mind doing 50 examples via teleoperation
if the robot learns quickly and then do the next 950.

But doing all 1000 manually?

That’s the problem.


### Where Are We Right Now?

I recently came across pi0.5 from Physical Intelligence which demonstrated impressive open-world generalization across tasks like laundry and kitchen in random unseen AirBnBs.

That’s promising. But this kind of task still feels out of reach. Mostly because the task itself isn’t cleanly defined.


### So How Do We Get There?

I don’t know - but my current mental model is to learn robust low-level skills, even from in-the-wild messy data<sup>1</sup>, and then enable fast adaptation to new tasks and environments.

### Random thought (Continued)

Coming back to the thought of building a service for this, there's also a human side to the challenges. If I want people to choose my robot for this, it has to be more reliable than a human. Faster. Cheaper. 

To dig into a bit of philosophy, there are many people who'd do this as a gig to make some extra money. What about them? Would they be okay with a robot taking their job? Or just enough to assit them? Or not want one at all? Am I building a robot to free people from such labor and focus on purposeful pursuits or am I trying to replace those humans who rely on such gigs? What is the right balance here? I don't know. But it's something to think about.

### Ending Thought

I don’t think we’re close to solving this yet. But this experience made robotics feel very real to me.

Maybe a few years from now, I’ll come back to this post and realize how naive this all sounds.

I hope I do.

Because that would mean we built something that works.

Until then, I’ll be thinking about how to build a robot that can do this. And maybe someday, I won’t have to pack 1000 gift bags again.

### Notes
<sup>1</sup>I learnt in my Automated Planning class, that a domain model learning system learns a good abstract model of the world, and then uses that to plan for new tasks. But the best part is that it doesn't need optimal trajectory data. In fact, it can even learn from random interactions. And I think that's a powerful idea.