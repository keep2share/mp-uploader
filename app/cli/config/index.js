import dev from './dev'
import def from './default'

export default (process.env.NODE_ENV === 'dev' ? dev : def);

