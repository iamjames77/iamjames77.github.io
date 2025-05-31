---
layout: post
title: Pruning Ratio
date: 2025-05-30 11:56:16
description: Pruning Ratio를 다루는 글입니다. 본 글은 MT Tiny ML and Efficiency Deep Learning Computing Lecture를 듣고 작성하였습니다.
tags: pruning
categories: Efficient-AI
---
# Pruning Ratio

<img src="/assets/img/Pruning-and-Sparsity-2/image.png" width="70%">

Pruning Granularity 포스트에서 Channel Pruning 시 **각 채널마다 다른 비율로 pruning하는 것이 중요하다**고 강조하였다.  
이는 곧, 어떤 레이어는 pruning에 더 민감하고, 어떤 레이어는 상대적으로 둔감하다는 것을 의미한다.

따라서 이러한 특성을 반영하려면, **각 레이어의 민감도 분석(sensitivity analysis)**을 통해 layer별로 pruning 비율을 조정할 필요가 있다.

## Analyze the Sensitivity of Each Layer

<img src="/assets/img/Pruning-and-Sparsity-2/ae9a27a9-497c-4910-bcce-02e1b112fb3d.png" width="70%">

- 각 레이어 $L_i$만 pruning하고, 나머지 레이어는 그대로 유지했을 때의 정확도를 측정한 결과이다.

<img src="/assets/img/Pruning-and-Sparsity-2/b3872d2b-0372-4a5d-8d1f-d5f712d2f7bd.png" width="70%">

- 전체 pruning 비율이 목표 수준에 도달하도록 성능 저하 허용 한계(Threshold)를 설정하고, 그에 맞는 pruning ratio를 조정한다.

**그렇다면, 이 방법이 최적인가?**

→ 그렇지 않다. 이 접근법은 각 레이어를 독립적으로 평가할 뿐, **레이어 간 상호작용(inter-layer dependency)**을 고려하지 않기 때문이다.

## AMC: AutoML for Model Compression

<img src="/assets/img/Pruning-and-Sparsity-2/image.png" width="70%">

AMC는 강화 학습을 기반으로 한 자동화된 모델 압축 기법이다. 각 레이어에 대해 적절한 pruning 비율을 학습을 통해 자동으로 찾아내는 것이 핵심

AMC는 다음과 같은 요소들로 구성된 강화 학습 문제로 정의된다:

- **State**: 레이어 인덱스, 채널 수, 커널 크기, FLOPs 등 각 레이어의 특성 정보
- **Action**: 연속적인 값으로 표현되는 pruning 비율 (pruning ratio)
- **Agent**: DDPG(Deep Deterministic Policy Gradient) 에이전트 — 연속적인 출력 제어가 가능
- **Reward**:

  $$
  R = 
  \begin{cases}
  -\text{Error}, & \text{제약 조건을 만족하는 경우} \\
  -\infty, & \text{제약 조건을 위반하는 경우}
  \end{cases}
  $$

  - 성능(정확도) 저하를 최소화하면서, latency나 연산량(FLOPs) 같은 제약 조건을 만족시키는 방향으로 보상
  - 사전에 구축한 lookup table을 이용하여 latency 제약 조건을 빠르게 평가 및 최적화 가능

## NetAdapt

<img src="/assets/img/Pruning-and-Sparsity-2/image-1.png" width="70%">

NetAdapt는 주어진 리소스 제약 조건(latency, energy 등)을 만족하는 pruning ratio를 **자동으로 찾아내는 알고리즘**이다.

- 이 알고리즘은 **반복적으로 수행**되며,
- 각 반복마다 모델의 latency를 일정 수준만큼 줄이는 방향으로 pruning을 적용한다

### 🔁 전체 절차

1. **초기 모델 선택**  
   - 원래의 Dense 모델에서 시작

2. **레이어별 pruning 후보 생성**  
   - 각 레이어에 대해 \(\Delta R\)만큼 latency를 줄이는 다양한 pruning 후보들을 생성

3. **간단한 fine-tuning 수행**  
   - 각 후보 모델에 대해 간단한 학습(예: 1만 번 정도) 후 정확도 평가

4. **가장 정확도가 높은 후보 선택**

5. **1~4단계를 반복**  
   - 전체 latency가 최종 목표를 만족할 때까지 위 과정을 반복

6. **최종적으로 장기적인 fine-tuning 수행**  
   - 선택된 모델을 기반으로 완전한 재학습 수행

<img src="/assets/img/Pruning-and-Sparsity-2/image-2.png" width="70%">

NetAdapt는 반복할 때마다 새로운 모델을 생성하므로, **모델의 개수 = 반복 횟수**가 된다.