using EPiServer.Core;
using EPiServer.PlugIn;
using EPiServer.ServiceLocation;
using EPiServer.SpecializedProperties;
using EPiServer.Web.Routing;
using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;

namespace PropertyLinkItem.Editor
{
    [PropertyDefinitionTypePlugIn]
    public class PropertyLinkItem : PropertyLongString
    {
        public Injected<IUrlResolver> LinkResolver { get; set; }

        private static readonly Regex SafeStringCleaner = new Regex("[\\u0000-\\u001F]", RegexOptions.Compiled);

        public override Type PropertyValueType => typeof(LinkItem);

        public override object SaveData(PropertyDataCollection properties)
        {
            return base.LongString;
        }

        public override object Value
        {
            get => Link;
            set
            {
                if (value is LinkItem linkItem)
                {
                    Link = linkItem;
                }
                else
                {
                    base.Value = value;
                }
            }
        }

        private LinkItem Link
        {
            get => ParseToLinkItem(LongString);
            set => LongString = ToLongString(value);
        }

        private LinkItem ParseToLinkItem(string str)
        {
            if (string.IsNullOrEmpty(str))
                return null;

            LinkItem link;
            try
            {
                XElement xelement = XElement.Parse(str);

                link = new LinkItem() { LinkResolver = this.LinkResolver, Text = xelement.Value };
                foreach (XAttribute xattribute in xelement.Attributes().Where(a => !string.IsNullOrEmpty(a.Value)))
                    link.Attributes.Add(xattribute.Name.LocalName, xattribute.Value);
            }
            catch (XmlException ex)
            {
                throw new InvalidPropertyValueException(typeof(PropertyLinkItem).ToString(), str, ex);
            }
            catch (ArgumentException ex)
            {
                throw new InvalidPropertyValueException(typeof(PropertyLinkItem).ToString(), str, ex);
            }

            return link;
        }

        private string ToLongString(LinkItem link)
        {
            if (link == null || string.IsNullOrEmpty(link.Href))
                return null;


            var xelement = new XElement("a", link.Attributes.Where(a => !string.IsNullOrEmpty(a.Value)).Select(a => new XAttribute(a.Key, SafeString(a.Value))));
            if (!string.IsNullOrEmpty(link.Href))
                xelement.SetAttributeValue("href", LinkResolver.Service.GetPermanent(link.Href, true));
            if (!string.IsNullOrEmpty(link.Text))
                xelement.SetValue(SafeString(link.Text));

            return xelement.ToString(SaveOptions.DisableFormatting);
        }

        private static object SafeString(string str)
        {
            if (!string.IsNullOrEmpty(str))
                return SafeStringCleaner.Replace(str, "");

            return string.Empty;
        }
    }
}
