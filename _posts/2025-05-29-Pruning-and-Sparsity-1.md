---
layout: post
title: Pruning and Sparsity 1
date: 2025-05-29 16:40:16
description: 신경망에서 중요하지 않은 weight나 뉴런을 다양한 기준(크기, 출력, 손실 변화 등)에 따라 제거하여 모델을 작고 효율적으로 만드는 기법인 Pruning을 정리한 자료입니다.
tags: pruning
categories: Efficient-AI
---

# Background

<img src="/assets/img/Pruning-and-Sparsity-1/image.png" width="70%">

Computing's Energy Problem (and What We Can Do About it) [Horowitz, M., IEEE ISSCC 2014]

에너지 비용 관점에서 보았을 때 DRAM 접근 비용을 줄이는 것이 중요하다.

# Introduction to Pruning

## What Is Pruning?

<img src="/assets/img/Pruning-and-Sparsity-1/image-1.png" width="70%">

퍼셉트론에서 시냅스와 뉴런을 줄여 Neural Network를 줄이는 것이 Pruning이다.

## How should we formulate pruning?

일반적으로 Pruning의 목표는 다음과 같다:

$\text{arg min}_{W_p} L(x; W_p)$

$\text{subject to}\quad ||W_p||_0 ≤ N$

$W_p$에서 0이 아닌 값의 개수를 N개 이하의 조건에서 Loss를 최소화 하는 것 → 모델의 N개의 weight만 남기도록 희소화 하는 것이 목표

## Pruning ratio & Accuracy Loss


<img src="/assets/img/Pruning-and-Sparsity-1/image-1.png" width="70%">

Weights들의 분포를 보면 대부분 0에 집중되어 있다. 0에 가깝다는 것은 의미가 상대적으로 적은 Weight라고 판단 할 수 있다. 이 값들을 제거해보자

<img src="/assets/img/Pruning-and-Sparsity-1/image-3.png" width="70%">

당연하게도 이 값들을 제거하면 성능이 떨어진다.

<img src="/assets/img/Pruning-and-Sparsity-1/스크린샷_2025-05-29_오후_3.54.32.png" width="70%">

그러나 pruning 된 Weights를 fine-tuning하여 다시 재학습하면 훨씬 더 좋은 성능을 보인다.

<img src="/assets/img/Pruning-and-Sparsity-1/image-4.png" width="70%">

그리고 이를 반복하면 더 적은 크기의 높은 성능을 갖는 모델을 만들 수 있다.

단, 실행 속도 향상은 pruning 방식에 따라 달라질 수 있다

# Pruning Granularity

## The case of convolution layers

Conv layer에는 총 4개의 차원이 존재한다

- $C_i$: input channels(channels)
- $C_o$: output channels(filters)
- $k_h$: kernel size height
- $k_w$: kernel size width

이 4개의 차원은 더 폭 넓은 pruning 세분화 방식을 준다.

<img src="/assets/img/Pruning-and-Sparsity-1/image-5.png" width="70%">

### Fine-grained/Unstructured(이전 Pruning 방식)

<img src="/assets/img/Pruning-and-Sparsity-1/image-6.png" width="70%">

장점

- Pruning index 선택에 굉장히 유연하다
- 불필요한 가중치들을 유연하게 선택할 수 있기 때문에, 일반적으로 더 높은 압축률을 얻을 수 있다.

단점

- 가속하기 위해서는 커스텀 하드웨어가 필요, GPU에서는 불가능

### Pattern-based Pruning: N:M sparsity

<img src="/assets/img/Pruning-and-Sparsity-1/image-7.png" width="70%">

- N:M이란 M개의 elements 중 N개만 선택한 것
- 기본적으로 2:4 sparsity를 선택(50% sparsity)
- NVIDIA Ampere GPU 아키텍쳐에서 가속 가능. 이를 통해 2배 가속
- Compressed Matrix는 가중치의 실제값과 가중치가 있는 index 값(2-bit)으로 압축

### Channel Pruning

<img src="/assets/img/Pruning-and-Sparsity-1/image-8.png" width="70%">

- Matrix가 단순히 작아졌기 때문에 속도에 직접적인 영향을 미침
- 압축 비율이 적다

# Pruning Criterion

## Selection of Synapses to Prune

### Magnitude-based Pruning

**Weight의 크기에 따라 Pruning.**

1. element-wise pruning
    
    $Importance = |W|$
    
    <img src="/assets/img/Pruning-and-Sparsity-1/image-9.png" width="70%">
    
2. row-wise pruning
    
    $Importance = \sum_{i \in S}|w|$ - l1 norm
    
    <img src="/assets/img/Pruning-and-Sparsity-1/image-10.png" width="70%">
    
    $Importance = \sqrt{\sum_{i \in S}|w|^2}$ - l2 norm
    
    <img src="/assets/img/Pruning-and-Sparsity-1/image-11.png" width="70%">
    

### Scaling-based Pruning

**Scaling 값에 따라 Pruning**

<img src="/assets/img/Pruning-and-Sparsity-1/image-12.png" width="70%">

$z_{out} = \gamma \cdot z_{in}$

CNN 출력채널의 Scaling Factor가 작다는 것은 그 채널이 출력에 크게 기여하지 않는다는 의미. $\gamma$을 pruning 기준으로 사용.

$z_{out} = \gamma \cdot \frac{z_{in} - \mu_{\mathcal{B}}}{\sqrt{\sigma^2_{\mathcal{B}} + \epsilon}} + \beta$

이 $\gamma$는 BatchNorm 계수에서도 재활용 가능 

### Second-Order-based Pruning

**weight를 제거했을 때 생기는 loss의 변화량(δL)에 따라 Pruning**

→ 변화량이 가장 작은 weight부터 제거

$\delta L = L(x; W) - L(x; W_p = W - \delta W) \approx \sum_i g_i \delta w_i + \frac{1}{2} \sum_i h_{ii} \delta w_i^2 + \cdots$

- $g_i = \frac{\partial L}{\partial w_i}$ : 1차 도함수 (기울기)
- $h_{ii} = \frac{\partial^2 L}{\partial w_i^2}$ : 2차 도함수 (헤시안 대각 원소)

최종적으로는 테일러 급수의 2차 근사(Taylor 2nd-order approximation)를 통해 다음 항만 사용

$\delta L_i \approx \frac{1}{2} h_{ii} w_i^2$

단순히 magnitude(|w|)만 보는 것보다 정확하게 **중요도**를 판단할 수 있음

## Selection of Neurons to Prune

### Percentage-of-Zero-Based Pruning

**뉴런 출력 값 0의 비율에 따라 Pruning**

<img src="/assets/img/Pruning-and-Sparsity-1/스크린샷_2025-05-29_오후_6.15.27.png" width="70%">

APoZ(Average Percentage of Zeros): $\frac{0의 비율}{\text{전체 Ouput}}$

### Regression-based Pruning

**특정 층의 출력이 얼마나 잘 보존 되는지를 기준으로 pruning**

<img src="/assets/img/Pruning-and-Sparsity-1/image-13.png" width="70%">

**원본 출력**

$Z = X W^\top = \sum_{c=0}^{C-1} X_c W_c^\top$

- $X$:입력
- $W$:weight
- $Z$:출력

**pruning 후 출력**

$\hat{Z} = \sum_{c=0}^{C-1} \beta_c X_c W_c^\top$

$\beta_c \in \{0, 1\}$: 채널을 남길지(1) 말지(0)를 결정하는 선택 변수

$\min_{\beta, W} \| Z - \hat{Z} \|_F^2$값을 통해 원본 출력과 pruning 후 출력 간의 차이를 최소화 하는 것이 목표