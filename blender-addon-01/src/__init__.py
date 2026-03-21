bl_info = {
    "name": "Skeleton Addon",
    "author": "Your Name",
    "version": (1, 0),
    "blender": (3, 0, 0),
    "location": "View3D > Object > Hello World Operator",
    "description": "A skeleton Blender addon with boilerplate code",
    "warning": "",
    "doc_url": "",
    "category": "Generic",
}

import bpy

class WM_OT_HelloWorld(bpy.types.Operator):
    """Prints a message to the console and shows a report in the UI"""
    bl_idname = "wm.hello_world"
    bl_label = "Hello World Operator"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        # This message appears in the system console
        print("Hello World from the Skeleton Addon!")
        
        # This message appears as a brief popup in the Blender UI
        self.report({'INFO'}, "Hello World!")
        
        return {'FINISHED'}

def menu_func(self, context):
    self.layout.operator(WM_OT_HelloWorld.bl_idname)

# List of classes to register
classes = (
    WM_OT_HelloWorld,
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    
    # Add the operator to the 'Object' menu in the 3D View
    bpy.types.VIEW3D_MT_object.append(menu_func)

def unregister():
    # Remove the operator from the 'Object' menu
    bpy.types.VIEW3D_MT_object.remove(menu_func)
    
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)

if __name__ == "__main__":
    register()
