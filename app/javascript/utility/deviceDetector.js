const mobileResolutionTrigger = 992 //the resolution when the mobile activation fires

export default class DeviceDetector {
  isMobile() {
    const mobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()))
    return mobile || window.innerWidth < mobileResolutionTrigger
  }

  isChrome() {
    return /chrom(e|ium)/.test(navigator.userAgent.toLowerCase())
  }
}
