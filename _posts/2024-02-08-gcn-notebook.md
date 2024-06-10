---
layout: post
title: Spelled Out Intro to Graph Convolution Networks
date: 2024-02-08 08:57:00-0400
description: Implementation of the paper <i>Semi-Supervised Classification With Graph Convolutional Networks</i> by Kipf et al., ICLR 2017.
tags: jupyter
categories: spelled-out
giscus_comments: true
related_posts: false
---

This blog is the implementation of the paper [Semi-Supervised Classification With Graph Convolutional Networks](https://arxiv.org/abs/1609.02907) by Kipf et al., ICLR 2017. 

I've aimed to create a notebook that's easy to understand. It begins with a simple graph, explaining the GCN formula step by step. I implemented the GCN model using [PyTorch](https://pytorch.org) (without relying on specific graph libraries like [PyTorch Geometric](https://pytorch-geometric.readthedocs.io/en/latest/), [DGL](https://www.dgl.ai), etc.) on the Cora dataset. Additionally, I replicated a section of the paper called "Node Embeddings With Random Weights" using the Zachary Karate Club dataset. The goal was to demonstrate how GCN can be a powerful tool for extracting features from nodes in a graph.

Going ahead, I have also implemented all the variants of the GCN mentioned in the paper which are:
- Single Parameter Model
- 1st Order term only
- 1st order model
- Chebyshev Polynomials for k = 2
- MLP

{::nomarkdown}
{% assign jupyter_path = "assets/jupyter/Spelled-Out-Intro-to-GCN.ipynb" | relative_url %}
{% capture notebook_exists %}{% file_exists assets/jupyter/blog.ipynb %}{% endcapture %}
{% if notebook_exists == "true" %}
{% jupyter_notebook jupyter_path %}
{% else %}

<p>Sorry, the notebook you are looking for does not exist.</p>
{% endif %}
{:/nomarkdown}
