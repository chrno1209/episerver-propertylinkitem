using EPiServer.Cms.Shell;
using EPiServer.Cms.Shell.UI.ObjectEditing.InternalMetadata;
using EPiServer.ServiceLocation;
using EPiServer.Shell.ObjectEditing;
using EPiServer.Shell.ObjectEditing.EditorDescriptors;
using EPiServer.SpecializedProperties;
using System;
using System.Collections.Generic;

namespace PropertyLinkItem.Editor
{
    [EditorDescriptorRegistration(TargetType = typeof(LinkItem))]
    public class LinkItemEditorDescriptor : EditorDescriptor
    {
        public LinkItemEditorDescriptor()
        {
            ClientEditingClass = "episerver/linkItemEditor";
            AllowedTypes = ServiceLocator.Current.GetInstance<LinkableTypesAssembler>().LinkableTypes;
            AllowedTypesFormatSuffix = "link";
        }

        public override void ModifyMetadata(ExtendedMetadata metadata, IEnumerable<Attribute> attributes)
        {
            base.ModifyMetadata(metadata, attributes);

            metadata.EditorConfiguration["dialogContentParams"] = new
            {
                ModelType = typeof(LinkModel).FullName.ToLower(),
                BaseClass = "epi-link-item"
            };
        }
    }
}
