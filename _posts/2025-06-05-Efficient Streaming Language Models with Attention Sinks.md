---
layout: post
title: Efficient Streaming Language Models with Attention Sinks
date: 2025-06-05 15:30:00
description: Efficient Streaming Language Models with Attention Sinks을 읽고 논문을 정리한 글입니다.
tags: context length, Attention
categories: Efficient-AI, Paper-Review
---

# Introduction

## 문제점

스트리밍 어플리케이션엣 LLM을 배포하는 것은 다음 2개의 문제를 직면:

1. 디코딩 단계에서 KV를 캐싱하면 광범위한 메모리 소비됨
2. LLM은 학습 시퀀스 길이 보다 긴 텍스트로 일반화 불가능

<img src="/assets/img/StreamingLLM/image.png" width="70%">

## 기존 기술의 한계

- **Transformer**: 그림 (a) - 모든 토큰의 Key와 Value 상태를 캐시하는데, 이는 과도한 메모리 사용과 디코딩 latency 증가로 이어짐
- **Sequence Length Problem**: 시퀀스 길이가 attention window 크기 보다 커지면 성능이 저하됨
- **Window Attention**: 그림 (b) - 최근 토큰만 캐싱하는 방식, 효율적이지만 처음 토큰들이 캐시에서 제거되면 성능 붕괴.
- **Sliding Window + Re-computation**: 그림(c) - 새 토큰마다 최근 토큰으로 KV 재계산, 정확도는 높지만 느림

## Attention Sink

- Window Attention의 한계를 설명하는 현상
- 초기 토큰들이 의미와 무관하게 높은 Attention Score를 지속적으로 받는 **sink** 현상 발견 -이를 Attention Sink라고 정의
    - 이는 softmax 특성과 auto regressive 학습 구조에서 초기 토큰들이 항상 이후 토큰에 노출되는 구조 때문.

## Streaming LLM

- 유한한 길이의 attention 윈도우로 학습된 LLM이 아무런 파인튜닝 없이 무한한 시퀀스 길이로 일반화 할 수 있도록 해준다.
- 이는 초기 토큰 몇 개만 유지하며 안정적인 스트리밍 가능

# Related Work

## Length Extrapolation

> 목표: 훈련된 시퀀스 길이보다 더 긴 시퀀스도 처리할 수 있도록 일반화
> 

### Rotary Position Embedding (RoPE)

- Attention Layer마다 상대적인 위치 정보를 쿼리와 키에 주입하는 방식
- 학습 범위를 넘는 입력에서는 성능 저하가 보고됨

### ALiBi(Attention with Linear Biases)

- 쿼리-키 점수를 거리 기반으로 편향을 추가하여 상대적 위치 정보를 부여
- RoPE보다 extrapolation에 강하지만, 훈련 시퀀스보다 훨씬 긴 입력에서는 여전히 성능 붕괴

결론: 기존 방법 모두 “무한 길이 처리”까지는 도달하지 못함

## Context Window Extension

> 목표: 한 번에 처리할 수 있는 최대 길이(컨텍스트 윈도우)를 늘림
> 

### FlashAttention

- attention 연산 가속화
- 메모리 공간 감소

### Approximate Attention

- 모델 품질을 어느 정도 희생하는 대신 효율성을 높임

### RoPE 기반 확장

- 위치 임베딩 보간 기법을 사용해 기존 RoPE 기반 모델의 문맥 크기를 확장

결론: 이 접근은 LLM의 구조나 학습을 수정해야 하며, 여전히 “무한 스트리밍”에는 적합하지 않음

## Improving LLM`s Utilization of Long Text

> 목표:긴 문맥이 주어졌을 때, 이를 더 잘 활용하도록 LLM을 개선
> 
- 긴 문맥을 단순히 입력하는 것이 아니라, 실제로 중요 정보를 뽑아내고 활용하게 하려는 연구
- **Lost in the Middle** 문제 - 모델이 중간 부분 정보를 잘 놓침

결론: 문맥 활용을 개선하려는 연구는 여전히 초기 단계이며, 이 논문의 접근과는 독립적이지만 호환 가능

# StreamingLLM

## The failure of Window Attention and Attention Sinks

<img src="/assets/img/StreamingLLM/스크린샷_2025-06-03_오전_9.34.34.png" width="70%">

Window Attention은 최근 토큰만 저장해서 계산 속도는 빠르지만,

**초기 토큰들이 캐시에서 사라지면 perplexity가 급등**하며 성능이 붕괴됨

## **왜 LLM은 초기 토큰의 KV(Key/Value)를 제거하면 성능이 붕괴될까?**

<img src="/assets/img/StreamingLLM/image-1.png" width="70%">


- 위 그림은 Llama-2-7B의 모델의 모든 레이어와 헤드에서의 attention map을 시각화 한 그림이다. 하위 두 개 레이어를 제외한 **모든 레이어와 헤드에서 모델이 초기 토큰에 지속적으로 집중하는 현상**을 발견했다.

이로부터 얻은 정보는 다음과 같다

1. 초기 토큰의 KV를 제거하면 softmax 함수 분모 중상당 부분이 사라지게 되고
2. 이는 attention 계산에서 기대되던 분포와는 크게 다른 attention socre분포를 야기한다

초기 토큰이 중요한 가능성은 2가지가 있다.

1. 그 의미가 실제로 중요해서
2. **절대적인 위치에 대한 모델의 편향**이 있어서

이 둘을 구분하기 위해 초기 실험을 진행

초기 네 개 토큰을 의미 없는 줄바꿈 토큰 “\n”으로 대체

<img src="/assets/img/StreamingLLM/image-2.png" width="70%">

- 모델은 여전히 이 줄바꿈 토큰에 높은 attention을 부여
- 그리고 이 토큰들을 다시 추가하자 **원래 초기 토큰이 있을 때와 비슷한 수준의 perplexity로 회복**되었다

## LLMs attend to Initial Tokens as Attention Sinks

모델이 언어 모델링과의 의미적 관련성과 무관하게 초기 토큰에 과도하게 집중하는 이유를 설명하기 위해 우리는 **attention sink**라는 개념을 도입한다.

Softmax 함수 특성상, 모든 토큰에 대해 attention 값이 0이 되는 것을 허용하지 않기 때문에,

현재 임베딩이 자기 예측에 필요한 정보만으로 충분해도 모델은 다른 토큰들에게 일부 attention 값을 억지로 분배해야한다.

그 결과, 모델은 불필요한 attention 값을 특정 토큰에 몰아서 dump하는 경향이 생긴다.

그렇다면 왜 autoregressive LLM들이 일관되게 초기 토큰을 attention sink로 볼까?

- autoregressive LLM은 초기 토큰이 이후 모든 토큰에 노출 되지만, 나중 토큰은 제한된 수의 후속 토큰에만 표시된다.
- 결과적으로 초기 토큰은 불필요한 attention을 캡쳐하여 attention sinks 역할을 하도록 더 쉽게 훈련

LLM은 일반적으로 하나의 초기 토큰이 아닌 여러 개의 초기 토큰을 attention sinks로 활용하도록 학습된다.

4개의 초기 토큰을 추가하면 성능이 안정적으로 회복되만, 1~2개만 추가하면 충분한 성능 복구가 되지 않는다.

이러한 패턴이 생긴 이유:

- 사전 훈련 시 입력 샘플마다 일관된 시작 토큰이 존재하지 않았기 때문
- Llama-2는 각 단락 앞에 <s>토큰을 붙이지만, 청크 단위 나뉘어 지기 때문에, 실제 입력에서는 처음 위치에 랜덤 토큰이 배치되는 경우가 많다.

이런 불균일한 시작 구조로 인해 모델은 여러 초기 토큰을 attention sink로 활용한다.

본 논문은 다음과 같은 가설을 세운다.

> 모든 학습 샘플의 맨 앞에 학습 가능한 sink token을 넣는다면, 단 하나의 토큰만으로도 안정적인 attention sink 역할을 할 수 있을 것이다.
> 

## Rolling KV Cache With Attention Sink

> 목적: 모델의 파인 튜닝 없이도 window attention의 perplexity를 회복할 수 있는 방법
> 

<img src="/assets/img/StreamingLLM/image-3.png" width="70%">

현재 sliding window에 몇 개의 시작 토큰의 KV 값도 attention 계산에 포함시키는 것

1. Attention Sink: 초기 4개의 토큰 → attention 계산을 안정화 하는 역할
2. Rolling KV Cache: 가장 최근의 토큰들 → 모델링에 중요한 정보를 유지하는 역할

<img src="/assets/img/StreamingLLM/image-4.png" width="70%">

### 기존 Length Extrapolation 방법 들과 통합

> 중요한 차이: **원래 텍스트 위치**가 아니라 **캐시 내 위치를 기준**으로 위치 정보를 부여한다는 점
> 

예를 들어, 현재 캐시에 [0, 1, 2, 3, 6, 7, 8]이라는 토큰이 들어 있고,

이제 9번째 토큰을 디코딩하려는 상황이라면,

원래 텍스트 기준으로는 위치가 [0,1,2,3,6,7,8,9]가 되지만,

StreamingLLM에서는 이걸 다시 0부터 세어서 [0,1,2,3,4,5,6,7]로 재배치한다.

RoPE:

- 위치 정보를 부여하는 Rotary 연산이 적용되기 전의 Key벡터들을 캐시
- 디코딩 단계에서 rolling cache의 key에 다시 위치 변환을 적용

ALiBi:

- 거리 기반 선형 bias를 attention score에 직접 더하면 된다
- jumping bias가 아니라 연속적인 선형 편향을 적용

## PRE-TRAINING LLMS WITH ATTENTION SINKS

### 해결책 1: Sink Token을 도입

전역적으로 학습 가능한 attention sink 토큰을 의도적으로 도입하는 것

→ 이 토큰이 불필요한 attention 점수를 받아주는 용도로 설계

## 해결책 2:Softmax 변형 함수 사용

SoftMax-off-by-One이라는 변형된 함수를 사용

$\text{SoftMax}_1(x)i = \frac{e^{x_i}}{1 + \sum_{j=1}^N e^{x_j}}$

이 함수는 attention weight의 총합이 반드시 1이 되도록 강제하지 않기 때문에, 불필요한 attention을 특정 토큰에 억지로 분배할 필요가 줄어든다.

이 softmax에 Key, Value값이 모두 0인 가상의 토큰을 앞에 추가한 것 과 수학적으로 동일하다

→ 본 논문에서는 이 방법을 “Zero Sink”라고 부르기로 함

### 검증 실험

**Vanilla**: 기존 Softmax를 그대로 실험한 것

**Zero Sink**: $\text{SoftMax}_1$을 사용한 것

**Sink Token**: 각 샘플 앞에 학습 가능한 placeholder sink token을 추가한 모델

<img src="/assets/img/StreamingLLM/image-5.png" width="70%">

Zero Sink는 attention sink 문제를 일부 완화시켰지만, 여전히 **다른 초기 토큰들이 attention sink 역할을 일부 맡음**

Sink Token은 **단 하나의 토큰만으로도 attention 안정성이 충분히 확보됨**

# 4. Experiments

**모델**:

- Llama-2 - RoPE
- MPT - ALiBi
- Pythia - RoPE
- Falcon - RoPE

Attention 기법:

- Dense Attention
- Window Attention
- Sliding Window + Re-computation
- Streaming LLM

## Language Modeling on Long Texts Across LLM Families And Scales

> 목표: 여러 LLM에 대한 긴 텍스트 언어 모델링 비교
> 

<img src="/assets/img/StreamingLLM/스크린샷_2025-06-03_오전_9.34.34.png" width="70%">

**Dense Attention**: 긴 텍스트에서 성능 붕괴

**Window Attention**: 초기 토큰 없어지면 붕괴

**Sliding Window + Re-computation**: 성능 유지되지만 느림

**StreamingLLM**: 속도는 빠르면서 성능 유지

<img src="/assets/img/StreamingLLM/image-6.png" width="70%">

- StreamingLLM은 모델의 크기와 종류 상관 없이 상관없이 잘 작동

## RESULTS OF PRE-TRAINING WITH A SINK TOKEN

> 목표: Sink Token을 넣는것이 StreamingLLM을 향상시키는가에 대한 검증
> 

<img src="/assets/img/StreamingLLM/image-7.png" width="70%">

Sink Token을 추가하는 것이 모델 성능에 영향을 주지 않음

<img src="/assets/img/StreamingLLM/image-8.png" width="70%">

Zero-shot 측면에서도 성능에 영향을 주지 않음

<img src="/assets/img/StreamingLLM/image-5.png" width="70%">

Sink Token을 학습 때부터 도입하면, 추론 시에도 하나만 붙이면 충분하다.

반면, 일반 모델은 여러 초기 토큰을 함께 캐시에 넣어야 안정적인 결과를 낸다.

### Attention Visualization

<img src="/assets/img/StreamingLLM/image-9.png" width="70%">

Sink Token이 있으면 모델이 그 하나에 집중해서 attention 분산을 안정적으로 처리하게 되고, 이는 스트리밍 상황에서 훨씬 효율적인 동작을 가능하게 만든다는 것을 시각적으로 확인 가능

## RESULTS ON STREAMING QUESTION ANSWERING WITH INSTRUCTION-TUNED MODEL

StreamingLLM의 실제 적용 가능성을 보여주기 위해, 실제 환경에서 자주 사용되는 instruction-tuned LLM을 활용해 다중 질의응답(multi-round QA) 상황을 시뮬레이션

1. ARC-[Challenge, Easy] 데이터셋의 모든 질문-정답 쌍을 하나로 이어 붙임
2. 이 연속된 스트림을 Llama-2-[7, 13, 70]B-Chat 모델에 입력
3. 각 답변 위치에서 모델이 생성한 결과를 정확히 일치하는지 기준(exact match)으로 평가

<img src="/assets/img/StreamingLLM/스크린샷_2025-06-04_오후_4.02.34.png" width="70%">

Dense: OOM

Window: 낮은 성능을 보임

Streaming LLM: One-shot과 비슷한 성능을 보임

### StreamingEval

<img src="/assets/img/StreamingLLM/image-10.png" width="70%">

1. 10줄 마다 모델에 질문을 던지고
2. 각 질문에 대한 답은 20줄 이내로 출력

<img src="/assets/img/StreamingLLM/스크린샷_2025-06-04_오후_5.52.24.png" width="70%">

## Ablation Study

### Number Of  Initial Tokens

<img src="/assets/img/StreamingLLM/image-11.png" width="70%">

- 1개 또는 2개의 토큰을 넣는 것은 불충분
- 4개의 초기 토큰을 넣었을 때 부터 충분한 효과가 나타남

### Cache Sizes

<img src="/assets/img/StreamingLLM/image-12.png" width="70%">

- 직관과는 다르게 Cache의 크기가 줄어든다고 해도 성능이 낮아지는 것은 아님
- 이는 모델이 긴 문맥을 제대로 활용하지 못한다는 한계점을 시사

## Efficiency Results

<img src="/assets/img/StreamingLLM/image-13.png" width="70%">

- StreamLLM은 Cache의 크기가 커질수록 선형적으로 latency가 증가
- Sliding Window + Re-computation은 latency가 제곱 형태로 급격히 증가