---
title: Ring Buffer
id: ring-buffer
date: 2023-07-17
full_link: https://www.kernel.org/doc/html/next/bpf/ringbuf.html
short_description: >
  The ring buffer is a memory buffer that behaves as if it had a circular shape, used for FIFO (first in, first out).
aka:
tags:
- architecture
---
The ring buffer is a memory buffer that behaves as if it had a circular shape, used for FIFO (first in, first out).

<!--more--> 
It uses to pass the events from the driver (kernel space) to the library libscap (user space)
