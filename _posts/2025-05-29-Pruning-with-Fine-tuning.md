---
layout: post
title: Pruning with Fine-tuning
date: 2025-05-29 16:40:16
description: Pruning with Fine-tuning을 다루는 글입니다. 본 글은 MT Tiny ML and Efficiency Deep Learning Computing Lecture를 듣고 작성하였습니다.
tags: pruning
categories: Efficient-AI
---
프루닝 후에는 정확도가 감소할 수 있기 때문에, 정확도 복원 및 pruning ratio 향상을 위해 fine-tuning이 필요하다

# Fine-tuning Pruned Neural Networks

<img src="/assets/img/Pruning-and-Sparsity-2/image-3.png" width="70%">

- 프루님으로 인해 손실된 정확도를 **다시 회복**하는 과정
- Fine-tuning 시에는 일반적으로 학습률을 원래 1/10 혹은 1/100 수준으로 낮게 설정
- 이를 통해 모델의 희소성을 유지하면서 성능 보존

## Iterative Pruning
<img src="/assets/img/Pruning-and-Sparsity-2/image-4.png" width="70%">

- Pruning → Fine-tuning을 반복하는 방식
- 각 반복마다 sparsity를 점점 더 높임(30% → 50% → 70%)
- 한 번에 무리하게 pruning을 하는 것보다 성능 하락이 적음

# Regularization
0이 아닌 weight에 페널티를 부여해 weight가 작아지도록 유도하기 위해 사용

- **L1 정규화**:
    
    $L’ = L(x; W) + \lambda \| W \|_1$
    
- **L2 정규화**:
    
    $L’ = L(x; W) + \lambda \| W \|^2$