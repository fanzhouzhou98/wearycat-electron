<template>
  <t-form ref="form" :class="['item-container', `login-password`]" :data="formData" :rules="FORM_RULES" label-width="0"
    @submit="onSubmit">
      <t-form-item name="account">
        <t-input v-model="formData.account" size="large" placeholder="请输入账号：">
          <template #prefix-icon>
            <t-icon name="user" />
          </template>
        </t-input>
      </t-form-item>

      <t-form-item name="password">
        <t-input v-model="formData.password" size="large" :type="showPsw ? 'text' : 'password'" clearable
          placeholder="请输入登录密码：">
          <template #prefix-icon>
            <t-icon name="lock-on" />
          </template>
          <template #suffix-icon>
            <t-icon :name="showPsw ? 'browse' : 'browse-off'" @click="showPsw = !showPsw" />
          </template>
        </t-input>
      </t-form-item>

    <t-form-item class="btn-container">
      <t-button block size="large" type="submit"> 登录 </t-button>
    </t-form-item>

    <div class="switch-container">
      <span v-if="type !== 'prod'" class="tip" @click="switchType('prod')">切换到正式环境</span>
      <span v-if="type !== 'uat'" class="tip" @click="switchType('uat')">切换到测试环境</span>
    </div>
  </t-form>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import type { FormRule } from 'tdesign-vue-next';
import { useUserStore } from '@/store';
import { JSEncrypt } from 'jsencrypt'
import { postRequest } from '@/utils/nativeRequest';
const userStore = useUserStore();
const emit = defineEmits(['switchEnv']);

const INITIAL_DATA = {
  account: 'mazhijiang',
  password: 'Ma12345678',
};

const FORM_RULES: Record<string, FormRule[]> = {
  account: [{ required: true, message: '账号必填', type: 'error' }],
  password: [{ required: true, message: '密码必填', type: 'error' }],
};

const type = ref('uat');

const formData = ref({ ...INITIAL_DATA });
const showPsw = ref(false);

const switchType = (val: string) => {
  type.value = val;
  emit('switchEnv', val);
  if (val === 'prod') {
      userStore.setBaseUrl('https://mall.oldmutual-chnenergy.com')
  } else {
    userStore.setBaseUrl('https://t-mendix.oldmutual-chnenergy.com')
  }
};

const router = useRouter();
// RSA加密
const setEncrypt = (msg: string) => {
  // 公钥
  const key = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCKbZqPP8xy3+dDmG2o10HHx02cilY6m0q79yOa75HN+Vj+DKGkvnneHWiRR9JxNgFJY7ncUkrlQuExXxbxqK66QGwwfLUvnOtf1qPrx/rVXdKOA9dPDfGFQJ0NgH7QsLj1WnHaB5zkPle5SFLlqKIN8Sdo0xaQ1kVHSKGTUkkT8wIDAQAB'
  const jsencrypt = new JSEncrypt()
  jsencrypt.setPublicKey(key)
  return jsencrypt.encrypt(msg)
}
// 为 validateResult 显式指定类型，避免隐式 any 类型问题
const onSubmit = async ({ validateResult }: { validateResult: boolean | Record<string, any> }) => {
  console.log('登录提交：：：=》》', validateResult, formData.value);
  if (validateResult === true) {
    try {
      let data = await postRequest('/product/backend/bee-system-service/system/login', {
        data: {
          userName: formData.value.account,
          password: setEncrypt(formData.value.password),
        }
      })
      console.log('登录结果：：：=》》', data);
      if (data.code === 1) {
        await userStore.updateUserInfo(data.result);
        MessagePlugin.success('登陆成功');
        router.replace({ path: '/' });
      } else {
        MessagePlugin.error(data.message || '登录失败');
      }
    } catch (e: any) {
      console.log(e);
      MessagePlugin.error(e.message);
    }
  }
};
</script>

<style lang="less" scoped>
@import url('../index.less');
</style>
