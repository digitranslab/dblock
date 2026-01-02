import ObjectRender from "@/components/common/objectRender";
import StringReader from "@/components/common/stringReaderComponent";
import NumberReader from "@/components/common/numberReader";

export default function ArrayReader({ array }: { array: any[] }): JSX.Element {
  const renderItem = (item: any) => {
    const type = typeof item;
    switch (type) {
      case "object":
        return <ObjectRender object={item} />;
      case "string":
        return <StringReader string={item} editable={false} setValue={() => {}} />;
      case "number":
        return <NumberReader number={item} />;
      default:
        return String(item);
    }
  };

  return (
    <div>
      <ul>
        {array.map((item, index) => (
          <li key={index}>{renderItem(item)}</li>
        ))}
      </ul>
    </div>
  );
}
