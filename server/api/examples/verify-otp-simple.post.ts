export default defineEventHandler(async (event) => {
  try {
    // 讀取請求體
    const body = await readBody(event)
    const { otp } = body

    // 簡化版：暫時跳過詳細的參數和格式驗證
    // 讓開發者先專注於前端組件的錯誤處理邏輯

    // 驗證 OTP 是否正確 (簡單版本)
    const isValid = otp === '123456'

    // 簡化回應，不包含具體錯誤訊息，讓開發者自行處理
    return {
      success: isValid,
      data: {
        verified: isValid,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error: unknown) {
    // 簡化版：統一回傳基本錯誤，讓開發者專注於前端錯誤處理
    return {
      success: false,
      data: {
        verified: false,
        timestamp: new Date().toISOString()
      }
    }
  }
})
