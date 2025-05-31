---
layout: post
title: Pruning Criterion
date: 2025-05-29 16:40:16
description: Pruning Criterion을 다루는 글입니다. 본 글은 MT Tiny ML and Efficiency Deep Learning Computing Lecture를 듣고 작성하였습니다.
tags: pruning
categories: Efficient-AI
---
# Selection of Synapses to Prune

## Magnitude-based Pruning

**Weight의 크기(절댓값)를 기준으로 중요도를 판단하여 pruning하는 방식.**

1. **Element-wise pruning**
   
   각 개별 weight의 절댓값을 기준으로 중요도를 측정합니다. 절댓값이 작은 weight부터 제거한다.
   
   $Importance = \|w\|$
   
   <img src="/assets/img/Pruning-and-Sparsity-1/image-9.png" width="70%">

2. **Row-wise pruning**
   
   weight의 묶음(예: 행 단위, 채널 등)에 대해 L1-norm 또는 L2-norm을 이용해 중요도를 계산한다.
   
   - **L1-norm 기준**:
     
     $Importance = \sum_{i \in S} \|w_i\|$
     
     <img src="/assets/img/Pruning-and-Sparsity-1/image-10.png" width="70%">

   - **L2-norm 기준**:
     
     $Importance = \sqrt{\sum_{i \in S} \|w_i\|^2}$
     
     <img src="/assets/img/Pruning-and-Sparsity-1/image-11.png" width="70%">
    

## Scaling-based Pruning

**Scaling 계수(γ)의 크기를 기준으로 채널의 중요도를 판단하여 pruning하는 방식.**

<img src="/assets/img/Pruning-and-Sparsity-1/image-12.png" width="70%">

$z_{out} = \gamma \cdot z_{in}$

CNN에서 출력 채널마다 부여되는 scaling factor $\gamma$는 해당 채널의 출력에 대한 기여도를 나타낸다.  
만약 $\gamma$ 값이 작다면, 그 채널은 상대적으로 중요도가 낮다고 판단할 수 있으므로 pruning 대상이 된다.

이 scaling factor는 다음과 같이 Batch Normalization 계수로부터도 얻을 수 있다:

$z_{out} = \gamma \cdot \frac{z_{in} - \mu_{\mathcal{B}}}{\sqrt{\sigma^2_{\mathcal{B}} + \epsilon}} + \beta$

따라서, 추가 파라미터 없이 BatchNorm의 γ를 그대로 pruning 기준으로 사용할 수 있어 실용적이다.

## Second-Order-based Pruning

**weight를 제거했을 때 손실 함수(Loss)의 변화량 \(\delta L\)을 근사적으로 계산하여 pruning하는 방식**

→ \(\delta L\) 값이 가장 작은 weight부터 제거함으로써 전체 성능 저하를 최소화한다.

손실 함수의 변화량은 테일러 급수 2차 근사(Taylor 2nd-order approximation)를 통해 다음과 같이 표현된다:

\[
\delta L = L(x; W) - L(x; W_p = W - \delta W) \approx \sum_i g_i \delta w_i + \frac{1}{2} \sum_i h_{ii} \delta w_i^2 + \cdots
\]

- \(g_i = \frac{\partial L}{\partial w_i}\): 1차 도함수 (기울기)
- \(h_{ii} = \frac{\partial^2 L}{\partial w_i^2}\): 2차 도함수 (Hessian 대각 원소)

수렴한 모델에서는 \(g_i \approx 0\)이라 가정하고, 교차 항은 무시하므로 다음 항만 사용하게 된다:

\[
\delta L_i \approx \frac{1}{2} h_{ii} w_i^2
\]

이 방식은 단순히 \(|w|\)만 보는 magnitude-based pruning보다 더 정확하게 **가중치의 중요도**를 판단할 수 있다.

# Selection of Neurons to Prune

## Percentage-of-Zero-Based Pruning

**ReLU 활성화 함수의 특성을 활용하여, 뉴런의 출력이 0인 비율(APoZ: Average Percentage of Zeros)을 기준으로 pruning하는 방식**

<img src="/assets/img/Pruning-and-Sparsity-1/스크린샷_2025-05-29_오후_6.15.27.png" width="70%">

- APoZ는 다음과 같이 정의된다:

  \[
  \text{APoZ} = \frac{\text{0으로 출력된 횟수}}{\text{전체 출력 횟수}}
  \]

- APoZ가 높은 뉴런은 대부분의 입력에 대해 출력을 생성하지 않으므로, **상대적으로 중요도가 낮은 뉴런**으로 간주되어 pruning 대상이 된다.
- 이 방식은 실제 데이터의 동작을 기반으로 하기 때문에 **데이터 기반 중요도 평가 방법**으로 분류된다.

## Regression-based Pruning

**특정 층의 출력값이 pruning 후에도 얼마나 잘 보존되는지를 기준으로 pruning을 수행하는 방식**

<img src="/assets/img/Pruning-and-Sparsity-1/image-13.png" width="70%">

### 원본 출력

$$
Z = X W^\top = \sum_{c=0}^{C-1} X_c W_c^\top
$$

- $X$: 입력
- $W$: weight
- $Z$: 출력

### Pruning 후 출력

$$
\hat{Z} = \sum_{c=0}^{C-1} \beta_c X_c W_c^\top
$$

- $\beta_c \in \{0, 1\}$: 채널 $c$를 유지(1)할지 제거(0)할지를 나타내는 선택 변수

최종 목표는 pruning 이후 출력 $\hat{Z}$가 원본 출력 $Z$와 최대한 비슷해지도록 하는 것입니다.  
이를 위해 다음의 최소화 문제를 풀게 됩니다:

$$
\min_{\beta, W} \| Z - \hat{Z} \|_F^2
$$

즉, **출력 간의 차이를 최소화**함으로써 중요한 채널만 남기고 성능을 유지하는 pruning을 구현합니다.