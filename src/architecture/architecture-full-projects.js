import xiyuanIndexSpread from '../assets/architecture/xiyuan/full-project/xiyuan-index-spread.png'
import xiyuanMasterPerspective from '../assets/architecture/xiyuan/full-project/xiyuan-master-perspective.png'
import xiyuanFiveScenesAnalysis from '../assets/architecture/xiyuan/full-project/xiyuan-five-scenes-analysis.png'
import xiyuanMasterplan from '../assets/architecture/xiyuan/full-project/xiyuan-masterplan.png'
import groundFloorPlan from '../assets/architecture/xiyuan/full-project/ground-floor-plan.png'
import section01 from '../assets/architecture/xiyuan/full-project/section-01.png'
import buildingCaomu from '../assets/architecture/xiyuan/full-project/building-caomu-fullpage.png'
import buildingBajiao from '../assets/architecture/xiyuan/full-project/building-bajiao-fullpage.png'
import scene01 from '../assets/architecture/xiyuan/full-project/scenes/scene-01.jpg'
import scene02 from '../assets/architecture/xiyuan/full-project/scenes/scene-02.jpg'
import scene03 from '../assets/architecture/xiyuan/full-project/scenes/scene-03.jpg'
import scene04 from '../assets/architecture/xiyuan/full-project/scenes/scene-04.jpg'
import scene05 from '../assets/architecture/xiyuan/full-project/scenes/scene-05.jpg'
import scene06 from '../assets/architecture/xiyuan/full-project/scenes/scene-06.jpg'

import cityTheaterConcept from '../assets/architecture/city-theater/city-theater-concept.png'
import cityTheaterContext from '../assets/architecture/city-theater/city-theater-context.png'
import cityTheaterCoverSource from '../assets/architecture/city-theater/city-theater-cover-source.png'
import cityTheaterDesignAnalysis from '../assets/architecture/city-theater/city-theater-design-analysis.png'
import cityTheaterDesignGuidelines from '../assets/architecture/city-theater/city-theater-design-guidelines.png'
import cityTheaterDistrictFloorplans from '../assets/architecture/city-theater/city-theater-district-floorplans.png'
import cityTheaterDistrictMasterplan from '../assets/architecture/city-theater/city-theater-district-masterplan.png'
import cityTheaterHistory from '../assets/architecture/city-theater/city-theater-history.png'
import cityTheaterMainAerial from '../assets/architecture/city-theater/city-theater-main-aerial.png'
import cityTheaterMasterplan from '../assets/architecture/city-theater/city-theater-masterplan.png'
import cityTheaterPreliminaryAnalysis from '../assets/architecture/city-theater/city-theater-preliminary-analysis.png'
import cityTheaterSceneNodes from '../assets/architecture/city-theater/city-theater-scene-nodes.png'
import cityTheaterSection from '../assets/architecture/city-theater/city-theater-section.png'
import cityTheaterSection02 from '../assets/architecture/city-theater/city-theater-section-02.png'
import cityTheaterSiteAnalysis from '../assets/architecture/city-theater/city-theater-site-analysis.png'

const xiyuanScenes = [
  { src: scene01, width: 2177, height: 5120, name: '集会' },
  { src: scene02, width: 2177, height: 5120, name: '观书' },
  { src: scene03, width: 2177, height: 5120, name: '拨阮' },
  { src: scene04, width: 2177, height: 5120, name: '作画' },
  { src: scene05, width: 2435, height: 5727, name: '题石' },
  { src: scene06, width: 2177, height: 5120, name: '论禅' },
]

const image = (src, width, height, alt, options = {}) => ({
  type: 'image',
  src,
  width,
  height,
  alt,
  ...options,
})

const horizontalImage = (src, width, height, alt, options = {}) => ({
  type: 'horizontal-image',
  src,
  width,
  height,
  alt,
  ...options,
})

export const fullProjectConfigs = {
  xiyuan: {
    theme: 'xiyuan',
    headerMeta: 'GARDEN ARCHITECTURE DESIGN · COURSE PROJECT',
    openingSpread: image(
      xiyuanIndexSpread,
      3508,
      2480,
      '西园集序项目目录与六境概览完整跨页',
      { eager: true },
    ),
    chapters: [
      {
        id: 'six-realms',
        number: '01',
        title: '六境',
        english: 'SIX REALMS',
        blocks: [
          { type: 'scene-grid', label: '西园集序六境场景', scenes: xiyuanScenes },
          image(xiyuanMasterPerspective, 3508, 2480, '西园集序园林建筑总体鸟瞰手绘透视图'),
        ],
      },
      {
        id: 'origin',
        number: '02',
        title: '缘起',
        english: 'ORIGIN',
        blocks: [image(xiyuanFiveScenesAnalysis, 3508, 2480, '西园集序五场景空间分析完整图版')],
      },
      {
        id: 'seeking-meaning',
        number: '03',
        title: '寻意',
        english: 'SEEKING MEANING',
        blocks: [
          image(xiyuanMasterplan, 1717, 2150, '西园集序园林建筑总平面图', {
            label: 'MASTERPLAN · 总平面图',
            modifier: 'full-project-plate--portrait full-project-plate--technical',
            highResolution: true,
          }),
        ],
      },
      {
        id: 'making-the-garden',
        number: '04',
        title: '营园',
        english: 'MAKING THE GARDEN',
        blocks: [
          image(groundFloorPlan, 3352, 2480, '西园集序园林建筑首层平面图', {
            label: 'GROUND FLOOR PLAN · 首层平面图',
            modifier: 'full-project-plate--technical',
            highResolution: true,
          }),
          image(section01, 3287, 845, '西园集序园林建筑剖面图', {
            label: 'SECTION 01 · 建筑剖面图',
            modifier: 'full-project-plate--technical full-project-plate--section',
            highResolution: true,
          }),
        ],
      },
      {
        id: 'fine-building',
        number: '05',
        title: '精筑',
        english: 'ARCHITECTURAL DETAILS',
        blocks: [
          image(buildingCaomu, 3508, 2480, '西园集序草木建筑设计完整图版'),
          image(buildingBajiao, 3508, 2480, '西园集序芭蕉建筑设计完整图版'),
        ],
      },
    ],
  },
  'city-theater': {
    theme: 'city-theater',
    headerMeta: 'URBAN DESIGN · COURSE PROJECT · 59.2 HA',
    chapters: [
      {
        id: 'urban-theater',
        number: '01',
        title: '城市剧场',
        english: 'URBAN THEATER',
        blocks: [
          image(cityTheaterCoverSource, 2326, 1706, '城市剧场嘉陵江北岸片区总体设计鸟瞰图', {
            eager: true,
            modifier: 'full-project-plate--major',
          }),
          image(cityTheaterMainAerial, 13791, 6814, '城市剧场四大主题剧场及公共空间节点总体鸟瞰分析图', {
            modifier: 'full-project-plate--major',
          }),
          {
            type: 'intro',
            paragraphs: [
              '本项目以“城市剧场”为主题，通过四维城市理论 [XYZT轴系统] 重构嘉陵江北岸片区。',
              '设计突破传统三维空间组织模式，在空间（XYZ）、时间（T）的复合维度中，构建四大主题剧场集群——生态剧场、工业剧场、居住剧场与办公剧场。每个剧场均由1个标志性剧场公共节点空间作为时空锚点，带动周边相应剧场空间的发展与活化；剧场与剧场之间又通过廊道、步道、视廊等多种方式相互链接，形成协同网络；同时将人流从各个方向引向核心剧场，将城市活力汇聚至核心剧场区域，最终形成层次丰富、时空交织的城市舞台。',
            ],
          },
        ],
      },
      {
        id: 'context',
        number: '02',
        title: '场地解读',
        english: 'CONTEXT',
        blocks: [
          horizontalImage(cityTheaterPreliminaryAnalysis, 13803, 2233, '城市剧场项目前期分析长图', {
            label: 'PRELIMINARY ANALYSIS · 前期分析',
            scrollCue: true,
          }),
          image(cityTheaterContext, 8731, 4168, '城市剧场区位与城市背景分析图'),
          image(cityTheaterHistory, 4809, 4025, '城市剧场场地历史演变分析图'),
          horizontalImage(cityTheaterSiteAnalysis, 13833, 1586, '城市剧场场地现状与问题分析长图', {
            label: 'SITE ANALYSIS · 场地分析',
          }),
        ],
      },
      {
        id: 'xyzt-system',
        number: '03',
        title: '四维生成',
        english: 'XYZT SYSTEM',
        blocks: [
          horizontalImage(cityTheaterConcept, 13833, 3239, '城市剧场四维城市理论XYZT轴系统概念生成图', {
            label: 'XYZT AXIS SYSTEM · 四维生成',
          }),
        ],
      },
      {
        id: 'masterplan',
        number: '04',
        title: '总体规划',
        english: 'MASTERPLAN',
        blocks: [
          image(cityTheaterMasterplan, 13781, 8847, '城市剧场北滨路1862片区城市设计总平面图', {
            label: 'MASTERPLAN · 总平面图',
            modifier: 'full-project-plate--technical full-project-plate--city-masterplan',
            highResolution: true,
          }),
        ],
      },
      {
        id: 'spatial-system',
        number: '05',
        title: '空间剖析',
        english: 'SPATIAL SYSTEM',
        blocks: [
          image(cityTheaterSection, 13808, 3575, '城市剧场城市空间剖面图一', {
            label: 'URBAN SECTION 01 · 城市空间剖面',
            modifier: 'full-project-plate--technical full-project-plate--section',
            highResolution: true,
          }),
          image(cityTheaterSection02, 12099, 5481, '城市剧场城市空间剖面图二', {
            label: 'URBAN SECTION 02 · 城市空间剖面',
            modifier: 'full-project-plate--technical',
            highResolution: true,
          }),
          horizontalImage(cityTheaterDesignAnalysis, 13808, 2670, '城市剧场空间与交通设计分析长图', {
            label: 'DESIGN ANALYSIS · 设计分析',
          }),
          horizontalImage(cityTheaterDesignGuidelines, 14043, 3863, '城市剧场分区设计导则图', {
            label: 'DESIGN GUIDELINES · 设计导则',
          }),
        ],
      },
      {
        id: 'district-design',
        number: '06',
        title: '局部设计',
        english: 'DISTRICT DESIGN',
        blocks: [
          image(cityTheaterDistrictMasterplan, 10104, 5154, '城市剧场重点片区局部总平面图', {
            label: 'DISTRICT MASTERPLAN · 局部总图',
            modifier: 'full-project-plate--technical full-project-plate--district',
            highResolution: true,
          }),
          image(cityTheaterDistrictFloorplans, 6788, 9039, '城市剧场重点片区各层平面图', {
            label: 'DISTRICT FLOOR PLANS · 局部各层平面图',
            modifier: 'full-project-plate--technical full-project-plate--portrait full-project-plate--district',
            highResolution: true,
          }),
          image(cityTheaterSceneNodes, 6866, 8947, '城市剧场重点片区小场景节点分析图', {
            modifier: 'full-project-plate--portrait full-project-plate--district',
          }),
        ],
      },
    ],
  },
}
