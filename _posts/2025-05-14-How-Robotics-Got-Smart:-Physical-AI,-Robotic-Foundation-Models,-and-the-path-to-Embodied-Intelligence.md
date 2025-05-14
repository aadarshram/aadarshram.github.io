---
layout: post
title: "How Robotics Got Smart: Physical AI, Robotic Foundation Models, and the Path to Embodied Intelligence"
subtitle: How LLMs led me into the next frontier of embodied AI 
cover-img: /assets/img/robots.png
tags: Concept, Research
comments: true
mathjax: true
author: Aadarsh Ramachandran
readtime: true
---


If you're an Artificial Intelligence and Robotics enthusiast, chances are you've been geeking out over NVIDIA's [GTC, 2025](https://www.nvidia.com/gtc/). From the adorable Star Wars-inspired [Blue](https://www.youtube.com/watch?v=XZ3MZZoZ23M), to Neo-1X casually gliding past you to water the plants, to Digit efficiently organizing warehouse racks- [robots were everywhere!](https://www.youtube.com/watch?v=Kbh-K6zrjtk&t=39s)—it's as if we've suddenly stepped into a sci-fi future. You can’t help but wonder: How did we get here? What's powering this new wave of intelligence in physical embodiments?


## Classical Robotics: Power without Flexibility

The robotics of the 20th and early 21st century was built on control theory, dynamics, and deterministic algorithms. Industrial arms could paint cars with millimeter precision, and autonomous vehicles could follow pre-mapped routes. But this prowess came with constraints.

These systems relied heavily on manual task decomposition and environmental constraints. A robot that could sort packages or weld joints couldn’t adapt if the workspace changed, the lighting shifted, or the objects varied in shape. There was little semantic understanding, no abstraction, and minimal learning from experience.

This model of robotics was effective in controlled environments—but brittle in the messy, dynamic real world of kitchens, hospitals, disaster zones, or city streets.

## The AI Revolution and its Influence on Robotics

Meanwhile, in NLP and computer vision, foundation models have dramatically raised the bar. These large models trained on massive internet-scale datasets demonstrated remarkable generalization and common-sense reasoning capabilities. They can write essays, solve logic puzzles, caption images, and even generate stunning art. 

The success of these models sparked a natural question:  
**Can we bring the same kind of general intelligence to robots?**

Robots, after all, need to interpret context, understand intent, and adapt to novel situations— just like language agents. But unlike words or pixels, physical actions unfold in a complex, unpredictable world governed by physics. Bringing cognition into embodiment wouldn’t just require bigger models—it demanded new ways of thinking.

## My Entry Point: From LLM Agents to Embodied AI

Back in December 2024, I was building small projects using LLMs— personal agents that could plan trips, summarize papers, or act as tutoring assistants. Watching AI take on these roles was exhilarating. But one question wouldn’t leave me alone:

How do we bring this kind of intelligence into the physical world?

That curiosity led me to explore the intersection of LLMs and robotics. That’s when I discovered [SayCan](https://say-can.github.io/), a 2022 paper that opened my eyes to what's possible. SayCan uses a language model (LM) for high-level planning and combines it with a value function representing the robot’s affordances— its physical capabilities.

Here’s how it works:
- Given an instruction (“bring me a snack”), the LM generates possible action plans.
- The affordance model scores each based on feasibility.
- The robot selects and executes the most physically achievable plan.

This approach grounded symbolic reasoning in physical action. Its successor, PaLM-SayCan, added chain-of-thought reasoning, enabling better task decomposition and planning.

For me, this was a turning point. Suddenly, language models weren’t just text agents—they were blueprints for physical intelligence.

## RT-Series: Towards Robotic Foundation Models

While some researchers focused on using LLMs as planners, others pursued an even bolder idea: building robotic foundation models themselves.

The [RT-1](https://robotics-transformer1.github.io/) from Google explores the idea of using transformer models to train on large-scale robot data. Discretizing continuous actions as discrete tokens (coined action tokenization), RT-1 treated robot behavior as a sequence prediction problem— analogous to how GPT predicts the next word.

Then came [RT-2](https://robotics-transformer2.github.io/), a major leap forward. RT-2 didn’t just learn from robot demonstrations—it co-trained on web-scale vision-language datasets, combining internet-level semantics with grounded robotics data. This model class was coined Vision-Language-Action (VLA).

RT-2 exhibited impressive zero-shot generalization:
- Recognizing unseen objects.
- Reasoning through tasks and robust to distractors.
- Following abstract instructions with minimal fine-tuning.

Just as GPT generalized across text domains, RT-2 hinted at generalization across physical tasks. This was more than performance— it was a shift in how we think about robotic intelligence.

## What makes Robotic Foundation Models different?

Traditional robotics pipelines treat perception, planning, and control as separate modules. Robotic foundation models unify these into one continuous architecture, enabling:

- End-to-end learning from pixels to actions.
- Semantic grounding, where instructions like “tidy up” map to multi-step, context-aware behavior.
- Cross-task generalization, where experience in one domain informs performance in another.

Most importantly, these models offer the potential for general-purpose physical intelligence— not just robots that follow scripts, but ones that interpret, adapt, and improvise.

## A field at its infancy- But full of Promise

Despite their promise, robotic foundation models are still early in development. They require immense data. They struggle with fine motor control. They often depend on large-scale infrastructure. And the real world remains full of noise, unpredictability, and edge cases.

There’s also an ongoing debate:
Should we keep separate modules for perception, planning, and control (for safety, interpretability, and robustness)? Or embrace fully end-to-end black-box models trained at scale?

Both approaches are valuable—and both are pushing the field forward in fascinating ways.

## What's Next

The journey— from LLM agents to RT-2—sparked my personal fascination with Physical AI. Like Jensen Huang said at GTC:

_“The ChatGPT moment for robotics is coming.”_

This summer, I’ll be diving deeper into this space through research and hands-on projects. If this frontier excites you as much as it excites me, let’s connect— I’d love to share ideas, learn from others, and shape the future of robotics together.

**Until then: onward, to embodied intelligence.**
