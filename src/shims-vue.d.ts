import type { MessageApiInjection } from 'naive-ui/lib/message/src/MessageProvider'

declare global {
  interface Window {
    $globalmessage: MessageApiInjection
  }
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
