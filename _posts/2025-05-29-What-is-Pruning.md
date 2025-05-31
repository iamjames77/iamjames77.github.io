---
layout: post
title: What is Pruning
date: 2025-05-29 16:40:16
description: Pruning의 개요를 다루는 글입니다. 본 글은 MT Tiny ML and Efficiency Deep Learning Computing Lecture를 듣고 작성하였습니다.
tags: pruning
categories: Efficient-AI
---

# Background

<img src="/assets/img/Pruning-and-Sparsity-1/image.png" width="70%">

Computing's Energy Problem (and What We Can Do About it) [Horowitz, M., IEEE ISSCC 2014]

에너지 비용 관점에서 보았을 때 연산을 하는 비용보다 DRAM 접근 비용이 약 200배 많다. 따라서 큰 모델을 돌리기 위해서는 모델의 크기를 줄이는 것이 중요하다.

# What Is Pruning?
<img src="/assets/img/Pruning-and-Sparsity-1/image-1.png" width="70%">

**Pruning(프루닝)**은 딥러닝에서 필요 없는 weight(가중치)나 뉴런을 제거하여 모델을 작고 효율적으로 만드는 기술.
쉽게 말해, **“쓸모없는 연결이나 뉴런을 잘라내는 가지치기”**라고 볼 수 있다.

# How should we formulate pruning?

Pruning은 일반적으로 다음과 같은 최적화 문제로 정식화할 수 있다:

$$
\text{arg min}_{W_p} L(x; W_p)
\\
\text{subject to} \quad \|W_p\|_0 \leq N
$$

여기서:
- $L(x; W_p)$: pruning된 weight $W_p$를 사용하는 모델의 손실 함수
- $\|W_p\|_0$: 0이 아닌 weight의 개수 (L₀-norm)
- $N$: 허용 가능한 최대 weight 수

즉, **weight 개수를 N개 이하로 제한하면서 손실 함수 \( L \)을 최소화하는 것이 pruning의 목표**이다.  
이 과정을 통해 모델을 희소화(sparsification)하고, 더 작고 효율적인 구조로 만든다.

# Neural Network Pruning
<img src="/assets/img/Pruning-and-Sparsity-1/image-1.png" width="70%">

신경망의 weight 분포를 살펴보면, 많은 값이 0 또는 0에 가까운 값을 가지며, 이는 상대적으로 중요도가 낮은 weight로 간주할 수 있다. 이러한 weight들을 제거하면 모델의 크기를 줄일 수 있다.

<img src="/assets/img/Pruning-and-Sparsity-1/image-3.png" width="70%">

하지만 weight를 단순히 제거하면 성능이 저하될 수 있다.  

<img src="/assets/img/Pruning-and-Sparsity-1/스크린샷_2025-05-29_오후_3.54.32.png" width="70%">

이 경우, pruning 이후 남은 weight를 기반으로 **fine-tuning(재학습)**을 수행하면 정확도를 상당 부분 회복할 수 있다.

<img src="/assets/img/Pruning-and-Sparsity-1/image-4.png" width="70%">

이 과정을 반복하면, 초기 모델보다 훨씬 **작고 효율적인 구조**를 갖는 모델로 압축이 가능하다.


다만, pruning을 통해 항상 실행 속도가 빨라지는 것은 아니다.  
**Unstructured pruning**은 구조가 불규칙해 일반적인 GPU에서 가속이 어렵고,  
**Structured pruning**(예: channel pruning)은 연산량 감소와 속도 향상 모두 가능하다.