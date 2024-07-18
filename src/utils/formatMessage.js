const formatMessage = (msg) => {
  return msg.split('\n').filter((line) => {
    if(line.startsWith('//') || !line.trim()){
      return false
    }
    return true
  }).join('\n')
}

export default formatMessage