---
layout: post
title: Pruning Granularity
date: 2025-05-29 16:40:16
description: Pruning Granularity를 다루는 글입니다. 본 글은 MT Tiny ML and Efficiency Deep Learning Computing Lecture를 듣고 작성하였습니다.
tags: pruning
categories: Efficient-AI
---
# The case of convolutional layers

## 합성곱 층에서의 Pruning 세분화

합성곱 신경망(Conv layer)은 일반적으로 다음과 같은 4가지 차원으로 구성된다:

- $C_i$: 입력 채널 수
- $C_o$: 출력 채널 수 (필터 개수)
- $k_h$: 커널 높이
- $k_w$: 커널 너비

이 네 가지 차원을 기준으로 다양한 수준의 pruning 세분화가 가능하며, pruning 패턴을 선택하는 데 있어 더 큰 유연성을 제공한다.

<img src="/assets/img/Pruning-and-Sparsity-1/image-5.png" width="70%">

## Fine-grained / Unstructured Pruning

<img src="/assets/img/Pruning-and-Sparsity-1/image-6.png" width="70%">

**장점**

- pruning index를 매우 세밀하게 조정할 수 있어, 유연성이 높다.
- 중요도가 낮은 가중치들을 정밀하게 골라낼 수 있어, 일반적으로 더 높은 압축률을 달성할 수 있다.

**단점**

- pruning된 구조가 불규칙적이기 때문에, GPU와 같은 일반적인 하드웨어에서는 연산 최적화가 어렵다.
- 실질적인 속도 향상을 위해서는 커스텀 하드웨어나 특수한 소프트웨어 지원이 필요하다.

## Pattern-based Pruning: N:M 구조적 희소성

<img src="/assets/img/Pruning-and-Sparsity-1/image-7.png" width="70%">

N:M sparsity란, 연속된 M개의 요소 중 N개만 남기고 나머지는 pruning하는 구조적 패턴을 의미한다.

- 대표적으로 **2:4 sparsity**가 사용되며, 이는 50% sparsity에 해당한다.
- 이 구조는 **정해진 패턴 내에서 pruning이 이뤄지므로 하드웨어 가속이 용이**다다.
- 실제로 NVIDIA의 **Ampere GPU 아키텍처**에서는 2:4 sparsity를 지원하며, 약 **2배의 추론 속도 향상**이 가능하다고 보고된다.
- Compressed Matrix 형태로 저장되며, 이는 **가중치의 실제 값 + 해당 위치(index)를 나타내는 2-bit 정보**로 구성된다.

## Channel Pruning

<img src="/assets/img/Pruning-and-Sparsity-1/image-8.png" width="70%">

Channel pruning은 합성곱 신경망에서 전체 채널(=출력 필터)을 통째로 제거하는 방식

- 채널을 제거하면 weight 행렬 전체의 크기가 줄어들기 때문에, **실제 연산량이 줄고 속도 향상에 직접적인 영향을 미친다**.
- 하지만 pruning 단위가 크기 때문에, **fine-grained pruning에 비해 압축률은 낮은 편이다**.

<img src="/assets/img/Pruning-and-Sparsity-1/image-14.png" width="70%">

- 따라서, **채널마다 압축률을 다르게 조정하는 방식**이 정해진 비율로 일괄 pruning하는 것보다 더 좋은 성능을 보일 수 있다.