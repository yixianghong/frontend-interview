<script setup lang="ts">
import InputOtp from '@/components/base/InputOtp.vue'
import useApi from '@/utils/useApi'

type VerifyStatus =
  | { status: 'idle'; message: string }
  | { status: 'verifying'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

const verifyStatus = ref<VerifyStatus>({ status: 'idle', message: '' })

/**
 * 處理 OTP 驗證完成事件
 * @param otp OTP 代碼
 * 呼叫驗證 API
 */
const handleComplete = (otp: string) => {
  verifyOtpApi(otp)
}

/**
 * 處理 OTP 變化事件
 * 重置狀態
 */
const handleChange = () => {
  resetStatus()
}

/**
 * 重置狀態
 */
const resetStatus = () => {
  verifyStatus.value = { status: 'idle', message: '' }
}

/**
 * 訊息常數
 */
const OTP_MESSAGES = {
  VERIFYING: '驗證中...',
  SUCCESS: '驗證成功',
  INVALID: '驗證碼錯誤，請重新輸入',
  ERROR: '驗證失敗，請稍後再試'
} as const

/**
 * 驗證 OTP
 * @param otp OTP 代碼
 * 如果驗證成功，則清空錯誤訊息
 * 如果驗證失敗，則顯示錯誤訊息
 */
const verifyOtpApi = async (otp: string) => {
  try {
    verifyStatus.value = { status: 'verifying', message: OTP_MESSAGES.VERIFYING }
    const response = await useApi().verifyOtpSimple.verify({ otp })
    if (response.success && response.data.verified) {
      verifyStatus.value = { status: 'success', message: OTP_MESSAGES.SUCCESS }
    } else {
      verifyStatus.value = { status: 'error', message: OTP_MESSAGES.INVALID }
    }
  } catch (error) {
    verifyStatus.value = { status: 'error', message: OTP_MESSAGES.ERROR }
  }
}
</script>

<template>
  <div>
    <InputOtp
      :length="6"
      :disabled="verifyStatus.status === 'verifying'"
      :is-success="verifyStatus.status === 'success'"
      :success-message="verifyStatus.message"
      :is-error="verifyStatus.status === 'error'"
      :error-message="verifyStatus.message"
      @complete="handleComplete"
      @change="handleChange"
    />
  </div>
</template>
