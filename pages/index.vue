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

const otpCode = ref<string>('')

/**
 * OTP 驗證碼長度
 * 可設定為 6、7 或 8 碼
 */
const OTP_LENGTH = 6

/**
 * 驗證 OTP
 * @param otp OTP 代碼
 * 如果驗證成功，則清空錯誤訊息
 * 如果驗證失敗，則顯示錯誤訊息
 */
const verifyOtpApi = async (otp: string) => {
  try {
    verifyStatus.value = { status: 'verifying', message: OTP_MESSAGES.VERIFYING }
    const response = await useApi().verifyOtp.verify({ otp })
    if (response.success && response.data.verified) {
      verifyStatus.value = { status: 'success', message: OTP_MESSAGES.SUCCESS }
    } else {
      verifyStatus.value = { status: 'error', message: OTP_MESSAGES.INVALID }
    }
  } catch (error) {
    verifyStatus.value = { status: 'error', message: OTP_MESSAGES.ERROR }
  }
}

/**
 * 監聽 OTP 代碼變化
 * 當輸入完成（達到指定長度）時自動觸發驗證
 */
watch(otpCode, (newValue) => {
  if (newValue.length === OTP_LENGTH) {
    verifyOtpApi(newValue)
  }
})
</script>

<template>
  <div>
    <InputOtp
      v-model="otpCode"
      :length="OTP_LENGTH"
      :disabled="verifyStatus.status === 'verifying'"
      :is-success="verifyStatus.status === 'success'"
      :success-message="verifyStatus.message"
      :is-error="verifyStatus.status === 'error'"
      :error-message="verifyStatus.message"
      :layout="'two-columns'"
      @change="handleChange"
    />
  </div>
</template>
