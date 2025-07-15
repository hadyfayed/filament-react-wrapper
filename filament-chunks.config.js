// Auto-generated chunk configuration for Filament React components
export default {
  "splitChunks": {
    "chunks": "all",
    "cacheGroups": {
      "admin": {
        "name": "panel-admin",
        "test": {},
        "priority": 10,
        "chunks": "all",
        "enforce": true
      },
      "dashboard": {
        "name": "panel-dashboard",
        "test": {},
        "priority": 30,
        "chunks": "all",
        "enforce": true
      },
      "user": {
        "name": "panel-user",
        "test": {},
        "priority": 20,
        "chunks": "all",
        "enforce": true
      }
    }
  },
  "optimization": {
    "runtimeChunk": "single",
    "moduleIds": "deterministic"
  }
}