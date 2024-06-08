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
{::nomarkdown}
{% assign jupyter_path = "assets/jupyter/Spelled-Out-Intro-to-GCN.ipynb" | relative_url %}
{% capture notebook_exists %}{% file_exists assets/jupyter/blog.ipynb %}{% endcapture %}
{% if notebook_exists == "true" %}
{% jupyter_notebook jupyter_path %}
{% else %}

<p>Sorry, the notebook you are looking for does not exist.</p>
{% endif %}
{:/nomarkdown}
