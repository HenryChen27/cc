import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'LLM',
    component: () => import( '../views/LLMView.vue')
  },
  {
    path: '/file',
    name: 'file',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/fileView.vue')
  },
  {
    path: '/search',
    name: 'search',
    component: () => import( '../views/searchView.vue')
  },
  {
    path: '/agent',
    name: 'agent',
    component: () => import( '../views/agentView.vue')
  },
  {
    path: '/knowledgeManage',
    name: 'knowledgeManage',
    component: () => import( '../views/knowledgeManageView.vue')
  },
  {
    path: '/knowledge',
    name: 'knowledge',
    component: () => import( '../views/knowledgeView.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
