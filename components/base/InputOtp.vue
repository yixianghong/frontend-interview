<script setup lang="ts">
interface Props {
  modelValue?: string
  length: number
  disabled: boolean
  isSuccess: boolean
  successMessage: string
  isError: boolean
  errorMessage: string
  layout?: 'single' | 'two-columns' | 'two-rows'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  length: 6,
  disabled: false,
  isSuccess: false,
  successMessage: '',
  isError: false,
  errorMessage: '',
  layout: 'single'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [otp: string]
}>()

const otpCode = ref<string[]>([])
const MIN_LENGTH = 4
const MAX_LENGTH = 8

/**
 * 監聽 OTP 代碼變化
 * 觸發 update:modelValue 和 change 事件
 */
watch(otpCode, (newValues) => {
  const otp = newValues.join('')
  emit('update:modelValue', otp)
  emit('change', otp)
}, { deep: true })

/**
 * 監聽外部 modelValue 變化
 * 同步到內部 otpCode
 */
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined) {
    const chars = newValue.split('').slice(0, props.length)
    otpCode.value = [...chars, ...Array(props.length - chars.length).fill('')]
  }
})

/**
 * 初始化 OTP 代碼
 * 將 OTP 代碼初始化為指定長度的空陣列
 */
const initializeOtpCode = () => {
  console.log('initializeOtpCode', props.length, MIN_LENGTH)
  if (props.length < MIN_LENGTH || props.length > MAX_LENGTH) {
    throw new Error('長度不在指定範圍內')
  }
  otpCode.value = Array(props.length).fill('')
  focusInputElement(0)
}

/**
 * 根據 layout 模式計算容器的 CSS class
 */
const containerClass = computed(() => {
  switch (props.layout) {
    case 'single':
      return 'flex gap-2'
    case 'two-columns':
      return 'grid grid-cols-2 gap-2 w-fit'
    case 'two-rows':
      return 'grid gap-2 w-fit'
    default:
      return 'flex gap-2'
  }
})

/**
 * 計算 2列式的 grid-template-columns
 * 根據 length 動態生成欄數
 */
const gridTemplateColumns = computed(() => {
  if (props.layout === 'two-rows') {
    const cols = Math.ceil(props.length / 2)
    return `repeat(${cols}, minmax(0, 1fr))`
  }
  return undefined
})

/**
 * 處理輸入事件
 * @param event 事件
 * @param otpIndex 輸入框索引
 * 合法字元則聚焦到下一個輸入框
 */
const handleInput = (event: Event, otpIndex: number) => {
  const target = event.target as HTMLInputElement
  target.value = target.value.replace(/[^0-9]/g, '')
  otpCode.value[otpIndex] = target.value
  if (target.value !== '' && otpIndex < props.length - 1) {
    focusInputElement(otpIndex + 1)
  }
}

/*
 * 處理 Backspace 鍵
 * 跳到上一個輸入框
 * 如果當前輸入框有值，則清空
 * 如果當前輸入框沒有值，則跳到上一個輸入框
 */
const handleBackspace = (event: KeyboardEvent, otpIndex: number) => {
  if (event.key === 'Backspace' && otpCode.value[otpIndex] === '') {
    focusInputElement(otpIndex - 1)
    return
  }
  otpCode.value[otpIndex] = ''
}

/**
 * 聚焦輸入框
 * @param otpIndex 輸入框索引
 */
const focusInputElement = async (otpIndex: number) => {
  await nextTick(() => {
    const inputElement = document.getElementById(`otp-${otpIndex}`) as HTMLInputElement
    if (inputElement) {
      inputElement.focus()
      inputElement.select()
    }
  })
}

/**
 * 處理貼上事件
 * @param e 事件
 * 將貼上資料轉換為數字，並賦值給當前輸入框，並聚焦到下一個輸入框
 */
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const pasteData = e.clipboardData?.getData('text').replace(/[^0-9]/g, '') || ''
  // Math.min 避免貼上資料超過指定長度
  for (let i = 0; i < Math.min(pasteData.length, props.length); i++) {
    otpCode.value[i] = pasteData[i]
  }
  // Focus 最後一個填入的格子
  const lastIndex = Math.min(pasteData.length, props.length)
  focusInputElement(lastIndex)
}

/**
 * 初始化 OTP 代碼
 * 聚焦到第一個輸入框
 */
onMounted(() => {
  initializeOtpCode()
})

</script>
<template>
  <div>
    <div
      :class="containerClass"
      :style="props.layout === 'two-rows' ? { gridTemplateColumns } : undefined"
    >
      <input
        v-for="(code, otpIndex) in otpCode.length"
        :id="`otp-${otpIndex}`"
        :key="otpIndex"
        :value="otpCode[otpIndex]"
        type="text"
        maxlength="1"
        :disabled="disabled"
        class="mb-2 size-10 border-2 border-black bg-white px-3 py-2 text-center text-sm outline-0"
        :class="{
          'border-red-500': isError,
        }"
        inputmode="numeric"
        autocomplete="off"
        @input="handleInput($event, otpIndex)"
        @keydown.backspace.prevent="handleBackspace($event, otpIndex)"
        @paste="handlePaste"
      >
    </div>
    <div
      v-if="isError"
      class="text-sm text-red-500"
    >
      {{ errorMessage }}
    </div>
    <div
      v-if="isSuccess"
      class="text-sm text-green-500"
    >
      {{ successMessage }}
    </div>
  </div>
</template>
